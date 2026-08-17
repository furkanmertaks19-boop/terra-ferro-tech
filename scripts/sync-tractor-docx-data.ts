import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { groupsToSpecs, type SpecGroup } from "../src/lib/admin-content";
import { flattenSpecs, SPEC_KEYS, toStoredSpecGroups } from "../src/lib/specs";

const SOURCE_FILE = "614 T2 Rops Stage IIIA.docx";

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

type Match = "EXACT" | "LIKELY" | "CONFLICT" | "NOT FOUND";

type DocxRecord = {
  heading: string;
  productId: string;
  match: Match;
  headingHp: number | null;
  headingStage: string | null;
  headingUsage: "Field" | "Orchard" | null;
  emission: string | null;
  modelName: string | null;
  serie: string | null;
  axle: string | null;
  cabinType: string | null;
  horsePower: number | null;
  usageType: string | null;
  gear: string | null;
  engine: string | null;
  torque: string | null;
  liftingCapacity: string | null;
  airConditioning: string | null;
  applyStage: boolean;
  applyUsage: boolean;
  applySerie: boolean;
  applyModel: boolean;
  notes: string[];
};

const DOCX_TRACTORS: DocxRecord[] = [
  {
    heading: "614 T2 Rops Stage IIIA — Orchard Series 58 HP",
    productId: "cmsup2skx0001mkhkd1m1xff5",
    match: "EXACT",
    headingHp: 58,
    headingStage: "Stage IIIA",
    headingUsage: "Orchard",
    emission: "Stage 3A",
    modelName: "614e",
    serie: "E",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Orchard",
    horsePower: 60,
    usageType: "Orchard",
    gear: "8 F / 8 R",
    engine: "Sonalika",
    torque: "230 Nm",
    liftingCapacity: "2200 KG",
    airConditioning: "No",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading HP 58 vs Horse Power: 60 HP — structured HP kullanılır."],
  },
  {
    heading: "514 T2 Rops Stage IIIA — Orchard Series 50 HP",
    productId: "cmsup2sjr0000mkhkegcot9ht",
    match: "EXACT",
    headingHp: 50,
    headingStage: "Stage IIIA",
    headingUsage: "Orchard",
    emission: "Stage 3A",
    modelName: "514 Fruit Garden",
    serie: "Fruit Garden",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Orchard",
    horsePower: 50,
    usageType: "Orchard",
    gear: "8 F / 8 R",
    engine: "Sonalika",
    torque: "230 Nm",
    liftingCapacity: "2200 KG",
    airConditioning: "No",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Cabin Type: Orchard kabin olarak okunmaz; ürün ROPS kalır."],
  },
  {
    heading: "804.4 Orchard Rops Stage IIIA — Orchard Series",
    productId: "cmsup2slg0002mkhkr2esirxi",
    match: "EXACT",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Orchard",
    emission: "Stage 3A",
    modelName: "804.4 Fruit Garden Rops",
    serie: "Fruit Garden",
    axle: null,
    cabinType: null,
    horsePower: 80,
    usageType: "Orchard",
    gear: null,
    engine: "Perkins",
    torque: "307 Nm",
    liftingCapacity: null,
    airConditioning: null,
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading HP yok. Horse Power: 80 HP. Mevcut katalog 75.5 HP."],
  },
  {
    heading: "804.4 Orchard Cabin Stage IIIA — Orchard Series",
    productId: "cmsup2sm00003mkhkz48cd88j",
    match: "LIKELY",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Orchard",
    emission: "Stage 3A",
    modelName: "804 Fruit Garden Cabin",
    serie: "Fruit Garden",
    axle: null,
    cabinType: null,
    horsePower: 80,
    usageType: "Orchard",
    gear: null,
    engine: "Perkins",
    torque: "307 Nm",
    liftingCapacity: null,
    airConditioning: null,
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Model Name 804 Fruit Garden Cabin vs Terra Ferro 804.4 Orchard Cabin. Display name korunur."],
  },
  {
    heading: "514 T2 Rops (eCapra) Stage V — Orchard Series",
    productId: "cmsup2smf0004mkhkdunaz1q7",
    match: "CONFLICT",
    headingHp: null,
    headingStage: "Stage V",
    headingUsage: "Orchard",
    emission: "Stage 5",
    modelName: "514e CRD5",
    serie: "E",
    axle: null,
    cabinType: null,
    horsePower: 50,
    usageType: "Field",
    gear: null,
    engine: "HCE STAGE-V (ECAPRA)",
    torque: "230 - 251 Nm",
    liftingCapacity: null,
    airConditioning: null,
    applyStage: true,
    applyUsage: false,
    applySerie: true,
    applyModel: true,
    notes: ["Heading Orchard vs Usage Type: Field — katalog Orchard korunur, Përdorimi güncellenmez."],
  },
  {
    heading: "614 T2 Rops (ECapra) Stage V — Orchard Series",
    productId: "cmsup2smy0005mkhknip5th35",
    match: "CONFLICT",
    headingHp: null,
    headingStage: "Stage V",
    headingUsage: "Orchard",
    emission: "Stage 5",
    modelName: "614e CRD5",
    serie: "E",
    axle: null,
    cabinType: null,
    horsePower: 60,
    usageType: "Field",
    gear: null,
    engine: "HCE STAGE-V (ECAPRA)",
    torque: "251 - 280 Nm",
    liftingCapacity: null,
    airConditioning: null,
    applyStage: true,
    applyUsage: false,
    applySerie: true,
    applyModel: true,
    notes: ["Heading Orchard vs Usage Type: Field — katalog Orchard korunur. HP 58 → 60."],
  },
  {
    heading: "514e Rops Stage IIIA — Field Series",
    productId: "cmsup2snf0006mkhk1go7li81",
    match: "CONFLICT",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "514 Fruit Garden",
    serie: "Fruit Garden",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Orchard",
    horsePower: 50,
    usageType: "Orchard",
    gear: "8 F / 8 R",
    engine: "Sonalika",
    torque: "230 Nm",
    liftingCapacity: "2200 KG",
    airConditioning: "No",
    applyStage: true,
    applyUsage: false,
    applySerie: false,
    applyModel: false,
    notes: [
      "NEEDS REVIEW: Field başlığı vs Usage Type Orchard / Model 514 Fruit Garden — 514 T2 orchard bloğu kopyalanmış olabilir.",
      "Katalog Field korunur. Engine/gear/lift/axle/AC uygulanır.",
    ],
  },
  {
    heading: "614e Rops Stage IIIA — Field Series",
    productId: "cmsup2snr0007mkhkfhbw7qm7",
    match: "CONFLICT",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "614e",
    serie: "E",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Orchard",
    horsePower: 60,
    usageType: "Orchard",
    gear: "8 F / 8 R",
    engine: "Sonalika",
    torque: "230 Nm",
    liftingCapacity: "2200 KG",
    airConditioning: "No",
    applyStage: true,
    applyUsage: false,
    applySerie: true,
    applyModel: true,
    notes: ["NEEDS REVIEW: Field başlığı vs Usage Type Orchard. Katalog Field korunur. HP 58 → 60."],
  },
  {
    heading: "604e Cabin Stage IIIA — Field Series",
    productId: "cmsup2sod0008mkhkxbd7i8xv",
    match: "LIKELY",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 5",
    modelName: "604e CRD5",
    serie: "E",
    axle: null,
    cabinType: null,
    horsePower: 60,
    usageType: "Field",
    gear: null,
    engine: "HCE STAGE-V (ECAPRA)",
    torque: "251 - 280 Nm",
    liftingCapacity: null,
    airConditioning: "Standard",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading Stage IIIA vs Emission Level Stage 5 — teknik Stage V. Display name 604e Cabin korunur. HP 58 → 60."],
  },
  {
    heading: "704e Cabin Stage IIIA — Field Series",
    productId: "cmsup2soz0009mkhkw3ahldtp",
    match: "LIKELY",
    headingHp: null,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 0",
    modelName: "704e+",
    serie: "E+",
    axle: null,
    cabinType: null,
    horsePower: 70,
    usageType: "Field",
    gear: null,
    engine: "Perkins",
    torque: "275 Nm",
    liftingCapacity: null,
    airConditioning: "Standard",
    applyStage: false,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["SOURCE CONFLICT / NEEDS REVIEW: Emission Level Stage 0 — Stage alanı güncellenmez. HP 73 → 70."],
  },
  {
    heading: "584e Cabin Stage IIIA — Field Series 58 HP",
    productId: "cmsup2spb000amkhkyeehnxs7",
    match: "LIKELY",
    headingHp: 58,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 5",
    modelName: "584e CRD5",
    serie: "E",
    axle: null,
    cabinType: null,
    horsePower: 58,
    usageType: "Field",
    gear: null,
    engine: "HCE STAGE-V (ECAPRA)",
    torque: "251 - 280 Nm",
    liftingCapacity: null,
    airConditioning: "Standard",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading Stage IIIA vs Emission Level Stage 5 — teknik Stage V. Display name 584e Cabin korunur."],
  },
  {
    heading: "854e Cabin Stage IIIA — Field Series 83.6 HP",
    productId: "cmsup2spu000bmkhk9ezsjtz6",
    match: "EXACT",
    headingHp: 83.6,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "854e Cabin",
    serie: "E",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Cabin",
    horsePower: 85,
    usageType: "Field",
    gear: "12 F / 12 R",
    engine: "Perkins",
    torque: "289 Nm",
    liftingCapacity: "2600 KG",
    airConditioning: "Yes",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading 83.6 HP vs Horse Power: 85 HP — structured 85 HP."],
  },
  {
    heading: "854 Lux Cabin Stage IIIA — Field Series 83.6 HP",
    productId: "cmsup2sq8000cmkhkgpp3vwwa",
    match: "EXACT",
    headingHp: 83.6,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "854 Lux Cabin",
    serie: "Lux",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Cabin",
    horsePower: 85,
    usageType: "Field",
    gear: "16 F / 8 R",
    engine: "Perkins",
    torque: "289 Nm",
    liftingCapacity: "3200 KG",
    airConditioning: "Yes",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading 83.6 HP vs Horse Power: 85 HP — structured 85 HP."],
  },
  {
    heading: "1054e Cabin Stage IIIA — Field Series 102 HP",
    productId: "cmsup2sqx000dmkhkjy8bc1s0",
    match: "EXACT",
    headingHp: 102,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "1054e Cabin",
    serie: "E",
    axle: "4 WD (Four Whell Drive)",
    cabinType: "Cabin",
    horsePower: 105,
    usageType: "Field",
    gear: "12 F / 12 R",
    engine: "Perkins",
    torque: "405 Nm",
    liftingCapacity: "3000 KG",
    airConditioning: "Yes",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Heading 102 HP vs Horse Power: 105 HP — structured 105 HP."],
  },
  {
    heading: "1104 Lux Cabin Stage IIIA — Field Series 110 HP",
    productId: "cmsup2sr7000emkhkh1tyzrgy",
    match: "EXACT",
    headingHp: 110,
    headingStage: "Stage IIIA",
    headingUsage: "Field",
    emission: "Stage 3A",
    modelName: "1104 Lux",
    serie: "Lux",
    axle: null,
    cabinType: null,
    horsePower: 110,
    usageType: "Field",
    gear: null,
    engine: "Perkins",
    torque: "416 Nm",
    liftingCapacity: null,
    airConditioning: "Standard",
    applyStage: true,
    applyUsage: true,
    applySerie: true,
    applyModel: true,
    notes: ["Model Name 1104 Lux vs display 1104 Lux Cabin — display korunur."],
  },
];

type ProductRow = {
  id: string;
  name: string;
  fullTitle: string;
  slug: string;
  series: string;
  subcategory: string | null;
  stage: string | null;
  horsePower: number | null;
  hasCabin: boolean;
  shortDescription: string | null;
  specs: unknown;
  specGroups: unknown;
  status: string;
  featured: boolean;
  isNew: boolean;
  isCampaign: boolean;
};

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

function normalizeStage(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact === "stage0" || compact === "0") return "Stage 0";
  if (compact === "stage3a" || compact === "stageiiia" || compact === "iiia" || compact === "3a") return "Stage IIIA";
  if (compact === "stage5" || compact === "stagev" || compact === "v" || compact === "5") return "Stage V";
  return value.trim();
}

function normalizeAxle(value: string | null): string | null {
  if (!value) return null;
  if (/4\s*wd|four\s*whe+l/i.test(value)) return "4 WD";
  return value.trim();
}

function cabinSpec(record: DocxRecord, hasCabin: boolean): string {
  const type = (record.cabinType ?? "").trim().toLowerCase();
  if (type === "cabin") return "Cabin";
  if (type === "rops") return "ROPS";
  return hasCabin ? "Cabin" : "ROPS";
}

function formatHp(value: number): string {
  return Number.isInteger(value) ? `${value} HP` : `${value} HP`;
}

function sameNumber(a: number | null, b: number | null) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Math.abs(a - b) < 0.001;
}

function sameText(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "").trim() === (b ?? "").trim();
}

function buildSpecs(record: DocxRecord, product: ProductRow): Record<string, string> {
  const out: Record<string, string> = {};
  if (record.applyModel && record.modelName) out[SPEC_KEYS.model] = record.modelName;
  if (record.horsePower != null) out[SPEC_KEYS.power] = formatHp(record.horsePower);
  if (record.applySerie && record.serie) out[SPEC_KEYS.series] = record.serie;
  if (record.applyUsage && record.usageType) out[SPEC_KEYS.usage] = record.usageType;
  if (record.applyStage) {
    const stage = normalizeStage(record.emission);
    if (stage && stage !== "Stage 0") out[SPEC_KEYS.emission] = stage;
  } else if (product.stage) {
    out[SPEC_KEYS.emission] = normalizeStage(product.stage) ?? product.stage;
  }
  if (record.engine) out[SPEC_KEYS.engine] = record.engine;
  if (record.torque) out[SPEC_KEYS.torque] = record.torque;
  const axle = normalizeAxle(record.axle);
  if (axle) out[SPEC_KEYS.axle] = axle;
  if (record.gear) out[SPEC_KEYS.gear] = record.gear;
  if (record.liftingCapacity) out[SPEC_KEYS.lift] = record.liftingCapacity;
  out[SPEC_KEYS.cabin] = cabinSpec(record, product.hasCabin);
  if (record.airConditioning) out[SPEC_KEYS.ac] = record.airConditioning;
  return out;
}

function shortDescription(name: string, subcategory: string | null, record: DocxRecord): string {
  const orchard = (subcategory ?? "").toLowerCase().includes("orchard") || record.headingUsage === "Orchard";
  const seriesLabel = orchard ? "Serisë Orchard" : "Serisë Field";
  const usage = orchard ? "për përdorim në pemishte" : "për përdorim bujqësor në terren";
  const parts = [`${name} është një traktor i ${seriesLabel}`];
  if (record.horsePower != null) parts.push(`me fuqi ${formatHp(record.horsePower)}`);
  if (record.engine) parts.push(`dhe motor ${record.engine}`);
  return `${parts.join(" ")}, i projektuar ${usage}.`;
}

type Change = { field: string; existing: string; source: string; action: string; note?: string };

function plan(record: DocxRecord, product: ProductRow | undefined) {
  if (!product) {
    return { record, product: null, result: "NOT FOUND" as const, changes: [] as Change[], next: null };
  }
  const existingFlat = flattenSpecs(asSpecs(product.specs), asGroups(product.specGroups));
  const nextFlat = buildSpecs(record, product);
  const nextStage = record.applyStage ? normalizeStage(record.emission) : product.stage;
  const nextHp = record.horsePower;
  const nextDescription = shortDescription(product.name, product.subcategory, record);
  const changes: Change[] = [];

  const hpAction = sameNumber(product.horsePower, nextHp) ? "KEEP" : "UPDATE";
  changes.push({
    field: "HP",
    existing: product.horsePower != null ? String(product.horsePower) : "null",
    source: nextHp != null ? String(nextHp) : "null",
    action: hpAction,
    note: record.headingHp != null && nextHp != null && record.headingHp !== nextHp ? "heading conflict" : undefined,
  });

  const stageSource = normalizeStage(record.emission);
  const stageAction = !record.applyStage ? "KEEP / NEEDS REVIEW" : sameText(normalizeStage(product.stage), nextStage) ? "KEEP" : "UPDATE TECHNICAL FIELD";
  changes.push({
    field: "Stage",
    existing: product.stage ?? "null",
    source: `technical: ${stageSource ?? "null"}`,
    action: stageAction,
    note: record.headingStage && stageSource && normalizeStage(record.headingStage) !== stageSource ? "heading conflict" : undefined,
  });

  for (const key of Object.values(SPEC_KEYS)) {
    const from = existingFlat[key] ?? "";
    const to = nextFlat[key] ?? "";
    if (!to && !from) continue;
    if (sameText(from, to)) continue;
    changes.push({
      field: key,
      existing: from || "null",
      source: to || "null",
      action: to ? "UPDATE" : "DROP",
    });
  }

  if (!sameText(product.shortDescription, nextDescription)) {
    changes.push({
      field: "shortDescription",
      existing: product.shortDescription || "null",
      source: nextDescription,
      action: "UPDATE",
    });
  }

  const specGroups = toStoredSpecGroups(nextFlat);
  return {
    record,
    product,
    result: "UPDATE" as const,
    changes,
    next: {
      horsePower: nextHp,
      stage: record.applyStage && nextStage && nextStage !== "Stage 0" ? nextStage : product.stage,
      shortDescription: nextDescription,
      specs: groupsToSpecs(specGroups),
      specGroups,
    },
  };
}

async function main() {
  if (!connectionString) throw new Error("DATABASE_URL missing");
  const pool = new Pool({ connectionString });
  try {
    const { rows } = await pool.query(`
      SELECT id, name, "fullTitle", slug, series, subcategory, stage, "horsePower", "hasCabin",
             "shortDescription", specs, "specGroups", status, featured, "isNew", "isCampaign"
      FROM "Product"
      WHERE category = 'TRACTOR'
    `);
    const byId = new Map<string, ProductRow>(
      rows.map((row) => [
        row.id,
        {
          ...row,
          horsePower: row.horsePower != null ? Number(row.horsePower) : null,
        },
      ]),
    );

    console.log(dryRun ? `DRY RUN — source ${SOURCE_FILE}\n` : `APPLY — source ${SOURCE_FILE}\n`);

    const matchedIds = new Set<string>();
    for (const record of DOCX_TRACTORS) {
      const product = byId.get(record.productId);
      const result = plan(record, product);
      if (product) matchedIds.add(product.id);

      console.log(product?.name ?? record.heading);
      console.log(`  DOCX: ${record.heading}`);
      console.log(`  Match: ${record.match}`);
      if (product) {
        console.log(`  id=${product.id} slug=${product.slug} status=${product.status}`);
        console.log(`  Guard: name/slug/status/featured/isNew/isCampaign unchanged`);
      }
      for (const note of record.notes) console.log(`  Note: ${note}`);
      for (const change of result.changes) {
        const note = change.note ? `  note: ${change.note}` : "";
        console.log(`  ${change.field}:`);
        console.log(`    existing: ${change.existing}`);
        console.log(`    source: ${change.source}`);
        console.log(`    action: ${change.action}${note}`);
      }
      console.log(`  Result: ${result.result}`);
      console.log("");

      if (dryRun || result.result !== "UPDATE" || !result.next || !product) continue;

      const updated = await pool.query(
        `
        UPDATE "Product"
        SET
          "horsePower" = $1,
          stage = $2,
          "shortDescription" = $3,
          specs = $4::jsonb,
          "specGroups" = $5::jsonb,
          "updatedAt" = NOW()
        WHERE id = $6
          AND slug = $7
          AND status = $8
          AND featured = $9
          AND "isNew" = $10
          AND "isCampaign" = $11
          AND name = $12
        `,
        [
          result.next.horsePower,
          result.next.stage,
          result.next.shortDescription,
          JSON.stringify(result.next.specs),
          JSON.stringify(result.next.specGroups),
          product.id,
          product.slug,
          product.status,
          product.featured,
          product.isNew,
          product.isCampaign,
          product.name,
        ],
      );
      if (updated.rowCount !== 1) {
        throw new Error(`Guard failed for ${product.name} (${product.id})`);
      }
    }

    for (const row of rows) {
      if (!matchedIds.has(row.id)) {
        console.log(`${row.name}`);
        console.log(`  DOCX: —`);
        console.log(`  Match: NOT FOUND`);
        console.log(`  Result: SKIP`);
        console.log("");
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
