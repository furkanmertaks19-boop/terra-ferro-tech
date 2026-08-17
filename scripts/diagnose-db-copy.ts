import { localPool, parsePostgresUrl, supabaseDirectUrl, supabasePool, APP_TABLES } from "./supabase-migrate-utils";

async function counts(pool: ReturnType<typeof localPool>, label: string) {
  const result: Record<string, number | string> = {};
  for (const table of APP_TABLES) {
    try {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
      result[table] = rows[0].n;
    } catch (error) {
      result[table] = error instanceof Error ? error.message.slice(0, 120) : "error";
    }
  }
  try {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM "_prisma_migrations"`);
    result._prisma_migrations = rows[0].n;
  } catch (error) {
    result._prisma_migrations = error instanceof Error ? error.message.slice(0, 120) : "missing";
  }
  console.log(`\n=== ${label} ===`);
  for (const [key, value] of Object.entries(result)) {
    console.log(`${key}: ${value}`);
  }
  return result;
}

async function main() {
  const source = localPool();
  const target = supabasePool();
  try {
    const localPing = await source.query("SELECT current_database() AS db, inet_server_addr() AS addr, current_user AS usr");
    console.log("LOCAL ok", localPing.rows[0].db, localPing.rows[0].usr);
    await counts(source, "LOCAL");
  } catch (error) {
    console.error("LOCAL FAIL", error instanceof Error ? error.message : error);
  }
  try {
    const remotePing = await target.query("SELECT current_user AS usr, current_database() AS db");
    console.log("\nSUPABASE ok", remotePing.rows[0].db, remotePing.rows[0].usr);
    await counts(target, "SUPABASE");
  } catch (error) {
    console.error("SUPABASE FAIL", error instanceof Error ? error.message : error);
    const parsed = parsePostgresUrl(supabaseDirectUrl);
    console.error("target user/host/port/db", parsed.user, parsed.host, parsed.port, parsed.database);
  }
  await source.end();
  await target.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
