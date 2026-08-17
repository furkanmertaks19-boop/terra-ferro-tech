import { localPool, supabasePool, APP_TABLES } from "./supabase-migrate-utils";

type Col = { column_name: string; data_type: string; udt_name: string };

async function tableColumns(pool: ReturnType<typeof localPool>, table: string): Promise<Col[]> {
  const { rows } = await pool.query(
    `
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
    `,
    [table],
  );
  return rows;
}

function qualify(name: string) {
  return `"${name}"`;
}

function isJsonColumn(col: Col) {
  return col.data_type === "json" || col.data_type === "jsonb" || col.udt_name === "json" || col.udt_name === "jsonb";
}

function normalizeValue(value: unknown, col: Col) {
  if (value === null || value === undefined) return value;
  if (isJsonColumn(col)) {
    return typeof value === "string" ? value : JSON.stringify(value);
  }
  return value;
}

async function copyTable(
  source: ReturnType<typeof localPool>,
  target: ReturnType<typeof supabasePool>,
  table: string,
) {
  const columns = await tableColumns(source, table);
  if (!columns.length) throw new Error(`No columns for ${table}`);
  const names = columns.map((col) => col.column_name);
  const { rows } = await source.query(`SELECT ${names.map(qualify).join(", ")} FROM ${qualify(table)}`);
  if (rows.length === 0) {
    console.log(`${table}: 0 source rows`);
    return { table, copied: 0 };
  }

  const colSql = names.map(qualify).join(", ");
  const updateSql = names
    .filter((name) => name !== "id")
    .map((name) => `${qualify(name)} = EXCLUDED.${qualify(name)}`)
    .join(", ");
  let copied = 0;
  const chunk = 25;
  for (let i = 0; i < rows.length; i += chunk) {
    const batch = rows.slice(i, i + chunk);
    const values: unknown[] = [];
    const tuples = batch.map((row, rowIndex) => {
      const placeholders = names.map((name, colIndex) => {
        values.push(normalizeValue(row[name], columns[colIndex]));
        return `$${rowIndex * names.length + colIndex + 1}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    await target.query(
      `INSERT INTO ${qualify(table)} (${colSql}) VALUES ${tuples.join(", ")} ON CONFLICT ("id") DO UPDATE SET ${updateSql}`,
      values,
    );
    copied += batch.length;
  }
  console.log(`${table}: upserted ${copied} rows`);
  return { table, copied };
}

async function main() {
  const source = localPool();
  const target = supabasePool();
  try {
    const sourceWrite = await source.query("SHOW transaction_read_only");
    console.log("source transaction_read_only:", sourceWrite.rows[0].transaction_read_only);
    try {
      await target.query("SET session_replication_role = replica");
      console.log("target: session_replication_role = replica");
    } catch (error) {
      console.warn(
        "Could not set session_replication_role; inserting in FK order.",
        error instanceof Error ? error.message : error,
      );
    }
    const results = [];
    for (const table of APP_TABLES) {
      results.push(await copyTable(source, target, table));
    }
    await target.query("SET session_replication_role = DEFAULT").catch(() => undefined);
    console.log("\nUpserted", results.reduce((sum, item) => sum + item.copied, 0), "rows total");
  } finally {
    await source.end().catch(() => undefined);
    await target.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
