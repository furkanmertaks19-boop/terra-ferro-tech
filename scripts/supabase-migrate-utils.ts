import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";

function parseEnvFile(filePath: string) {
  const out: Record<string, string> = {};
  const text = readFileSync(filePath, "utf8");
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
    out[key] = value;
  }
  return out;
}

export function parsePostgresUrl(raw: string): PoolConfig {
  const match = raw.match(/^(?:postgres(?:ql)?:\/\/)([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]*)/i);
  if (!match) throw new Error("Invalid Postgres URL");
  let password = decodeURIComponent(match[2]);
  if (password.startsWith("[") && password.endsWith("]") && password.length > 2) {
    password = password.slice(1, -1);
  }
  return {
    user: decodeURIComponent(match[1]),
    password,
    host: match[3],
    port: match[4] ? Number(match[4]) : 5432,
    database: match[5] || "postgres",
  };
}

const root = process.cwd();
const localEnv = parseEnvFile(path.join(root, ".env"));
const supabaseEnv = parseEnvFile(path.join(root, ".env.supabase"));

const localParts = parsePostgresUrl(localEnv.DIRECT_URL || localEnv.DATABASE_URL || "");
const supabaseDirectParts = parsePostgresUrl(supabaseEnv.DIRECT_URL || supabaseEnv.DATABASE_URL || "");
const supabasePoolParts = parsePostgresUrl(supabaseEnv.DATABASE_URL || "");

export const localUrl = localEnv.DIRECT_URL || localEnv.DATABASE_URL || "";
export const supabaseDirectUrl = supabaseEnv.DIRECT_URL || "";
export const supabasePoolUrl = supabaseEnv.DATABASE_URL || "";

export function localPool() {
  return new Pool({ ...localParts, max: 2 });
}

export function supabasePool() {
  return new Pool({
    ...supabaseDirectParts,
    max: 2,
    ssl: { rejectUnauthorized: false },
  });
}

export function supabasePoolerPool() {
  return new Pool({
    ...supabasePoolParts,
    max: 2,
    ssl: { rejectUnauthorized: false },
  });
}

export function encodedSupabaseDirectUrl() {
  const p = supabaseDirectParts;
  return `postgresql://${encodeURIComponent(p.user ?? "")}:${encodeURIComponent(String(p.password ?? ""))}@${p.host}:${p.port}/${p.database}`;
}

export const APP_TABLES = [
  "User",
  "ProductCategory",
  "Product",
  "Lead",
  "HomeSlide",
  "CategoryPage",
  "SiteSettings",
  "HomeSection",
  "GalleryCategory",
  "GalleryItem",
  "AuditLog",
  "PageContent",
] as const;
