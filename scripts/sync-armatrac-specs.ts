import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { ARMATRAC_SOURCES, UPDATABLE_PRODUCT_IDS } from "../src/lib/armatrac/catalog";
import { planMerge, type ProductSnapshot } from "../src/lib/armatrac/merge";
import type { SpecGroup } from "../src/lib/admin-content";

function loadEnv() {
  const text = readFileSync(path.join(process.cwd(), ".env"), "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");
const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const connectionString = raw.replace(/([?&])pgbouncer=true&?/, "$1").replace(/[?&]$/, "");

function asSpecs(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "string") out[key] = item;
  }
  return out;
}

function asGroups(value: unknown): SpecGroup[] | null {
  return Array.isArray(value) ? (value as SpecGroup[]) : null;
}

async function main() {
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const pool = new Pool({ connectionString });
  try {
    const { rows } = await pool.query(`
      SELECT
        id, name, "horsePower", stage, series, subcategory, "hasCabin",
        "shortDescription", specs, "specGroups", status, template,
        featured, "isNew", "isCampaign", slug, "referenceUrl"
      FROM "Product"
      WHERE category = 'TRACTOR'
    `);

    const byId = new Map<string, ProductSnapshot>(
      rows.map((row) => [
        row.id,
        {
          id: row.id,
          name: row.name,
          horsePower: row.horsePower != null ? Number(row.horsePower) : null,
          stage: row.stage,
          series: row.series,
          subcategory: row.subcategory,
          hasCabin: Boolean(row.hasCabin),
          shortDescription: row.shortDescription,
          specs: asSpecs(row.specs),
          specGroups: asGroups(row.specGroups),
          referenceUrl: row.referenceUrl ?? null,
          status: row.status,
          template: row.template,
          featured: Boolean(row.featured),
          isNew: Boolean(row.isNew),
          isCampaign: Boolean(row.isCampaign),
          slug: row.slug,
        },
      ])
    );

    console.log(dryRun ? "DRY RUN — no database writes\n" : "APPLY — updating allowed product IDs only\n");

    for (const source of ARMATRAC_SOURCES) {
      const product = source.productId ? byId.get(source.productId) ?? null : null;
      const plan = planMerge(source, product);
      console.log(`${source.label}`);
      console.log(`  Terra Ferro: ${plan.product?.name ?? "—"}`);
      console.log(`  Match: ${source.match}`);
      console.log(`  URL: ${source.url}`);
      if (source.notes.length) source.notes.forEach((note) => console.log(`  Note: ${note}`));
      if (plan.product) {
        console.log(
          `  Guard: status=${plan.product.status} template=${plan.product.template} featured=${plan.product.featured} slug=${plan.product.slug}`
        );
      }
      for (const change of plan.changes) {
        console.log(`  ${change.field}: ${change.from ?? "null"} → ${change.to ?? "null"}  ${change.status}`);
      }
      console.log(`  Result: ${plan.result}`);
      console.log("");

      if (dryRun || plan.result !== "UPDATED" || !plan.next || !product) continue;
      if (!UPDATABLE_PRODUCT_IDS.includes(product.id)) {
        throw new Error(`Refusing to update unlisted id ${product.id}`);
      }

      await pool.query(
        `
        UPDATE "Product"
        SET
          specs = $1::jsonb,
          "specGroups" = $2::jsonb,
          "shortDescription" = $3,
          "referenceUrl" = $4,
          "updatedAt" = NOW()
        WHERE id = $5
          AND status = $6
          AND template = $7
          AND featured = $8
          AND "isNew" = $9
          AND "isCampaign" = $10
          AND slug = $11
        `,
        [
          JSON.stringify(plan.next.specs),
          JSON.stringify(plan.next.specGroups),
          plan.next.shortDescription,
          plan.next.referenceUrl,
          product.id,
          product.status,
          product.template,
          product.featured,
          product.isNew,
          product.isCampaign,
          product.slug,
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
