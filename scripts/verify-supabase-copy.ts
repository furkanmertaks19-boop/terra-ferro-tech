import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { APP_TABLES, encodedSupabaseDirectUrl, localPool, supabasePool } from "./supabase-migrate-utils";

type Pool = ReturnType<typeof localPool>;

async function countMap(pool: Pool) {
  const result: Record<string, number> = {};
  for (const table of APP_TABLES) {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
    result[table] = rows[0].n;
  }
  const migrations = await pool.query(`SELECT COUNT(*)::int AS n FROM "_prisma_migrations"`);
  result._prisma_migrations = migrations.rows[0].n;
  return result;
}

async function idSet(pool: Pool, table: string) {
  const { rows } = await pool.query(`SELECT id FROM "${table}"`);
  return new Set(rows.map((row: { id: string }) => row.id));
}

async function publicTables(pool: Pool) {
  const { rows } = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  return rows.map((row: { tablename: string }) => row.tablename);
}

async function main() {
  const source = localPool();
  const target = supabasePool();
  const adapter = new PrismaPg(
    {
      connectionString: encodedSupabaseDirectUrl(),
      ssl: { rejectUnauthorized: false },
      max: 2,
    },
  );
  const prisma = new PrismaClient({ adapter });

  try {
    const localTables = await publicTables(source);
    const remoteTables = await publicTables(target);
    const localCounts = await countMap(source);
    const remoteCounts = await countMap(target);

    console.log("=== PUBLIC TABLES ===");
    console.log("local:", localTables.join(", "));
    console.log("supabase:", remoteTables.join(", "));

    const extraLocal = localTables.filter((name) => !remoteTables.includes(name));
    const extraRemote = remoteTables.filter((name) => !localTables.includes(name));
    if (extraLocal.length) console.log("only on local:", extraLocal.join(", "));
    if (extraRemote.length) console.log("only on supabase:", extraRemote.join(", "));

    console.log("\n=== COUNTS ===");
    console.log("table".padEnd(22), "local", "supabase", "match");
    let mismatch = 0;
    for (const table of [...APP_TABLES, "_prisma_migrations"] as const) {
      const a = localCounts[table];
      const b = remoteCounts[table];
      const ok = a === b ? "OK" : "DIFF";
      if (ok === "DIFF") mismatch += 1;
      console.log(String(table).padEnd(22), String(a).padStart(5), String(b).padStart(8), ok);
    }

    console.log("\n=== ID SETS ===");
    for (const table of APP_TABLES) {
      const localIds = await idSet(source, table);
      const remoteIds = await idSet(target, table);
      const missing = [...localIds].filter((id) => !remoteIds.has(id));
      const extra = [...remoteIds].filter((id) => !localIds.has(id));
      if (!missing.length && !extra.length) {
        console.log(`${table}: IDs match (${localIds.size})`);
      } else {
        mismatch += 1;
        console.log(`${table}: missing on supabase ${missing.length}, extra on supabase ${extra.length}`);
        if (missing.length) console.log("  missing", missing.slice(0, 10));
        if (extra.length) console.log("  extra", extra.slice(0, 10));
      }
    }

    const users = await source.query(
      `SELECT id, email, username, role, "isActive", "passwordHash" FROM "User" ORDER BY email`,
    );
    const remoteUsers = await target.query(
      `SELECT id, email, username, role, "isActive", "passwordHash" FROM "User" ORDER BY email`,
    );
    console.log("\n=== USERS / PASSWORD HASHES ===");
    for (const localUser of users.rows) {
      const remoteUser = remoteUsers.rows.find((row: { id: string }) => row.id === localUser.id);
      const hashMatch = remoteUser?.passwordHash === localUser.passwordHash;
      console.log(
        localUser.email,
        "id",
        localUser.id === remoteUser?.id ? "match" : "DIFF",
        "role",
        remoteUser?.role,
        "active",
        remoteUser?.isActive,
        "hash",
        hashMatch ? "identical" : "DIFF",
        "hashPrefix",
        String(remoteUser?.passwordHash || "").slice(0, 7),
      );
    }

    const productUrlSql = `
      SELECT id, "coverImage", images, "technicalPdfUrl", "technicalPdfPublicId"
      FROM "Product"
      ORDER BY id
    `;
    const localProducts = await source.query(productUrlSql);
    const remoteProducts = await target.query(productUrlSql);
    let urlDiff = 0;
    for (const localProduct of localProducts.rows) {
      const remoteProduct = remoteProducts.rows.find((row: { id: string }) => row.id === localProduct.id);
      const sameCover = (remoteProduct?.coverImage || null) === (localProduct.coverImage || null);
      const samePdf = (remoteProduct?.technicalPdfUrl || null) === (localProduct.technicalPdfUrl || null);
      const sameImages = JSON.stringify(remoteProduct?.images || []) === JSON.stringify(localProduct.images || []);
      if (!sameCover || !samePdf || !sameImages) urlDiff += 1;
    }
    console.log("\n=== PRODUCT URLS ===");
    console.log("products compared", localProducts.rows.length, "url diffs", urlDiff);

    const gallerySql = `SELECT id, "mediaUrl", "thumbnailUrl", "publicId" FROM "GalleryItem" ORDER BY id`;
    const localGallery = await source.query(gallerySql);
    const remoteGallery = await target.query(gallerySql);
    let galleryDiff = 0;
    for (const localItem of localGallery.rows) {
      const remoteItem = remoteGallery.rows.find((row: { id: string }) => row.id === localItem.id);
      if (
        remoteItem?.mediaUrl !== localItem.mediaUrl ||
        (remoteItem?.thumbnailUrl || null) !== (localItem.thumbnailUrl || null)
      ) {
        galleryDiff += 1;
      }
    }
    console.log("gallery items compared", localGallery.rows.length, "url diffs", galleryDiff);

    console.log("\n=== PRISMA CLIENT PING (SUPABASE) ===");
    const ping = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    const slideCount = await prisma.homeSlide.count();
    const galleryCount = await prisma.galleryItem.count();
    const pageCount = await prisma.pageContent.count();
    const leadCount = await prisma.lead.count();
    const adminUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, username: true, role: true, mustChangePassword: true, lockedUntil: true },
    });
    console.log("queryRaw", ping);
    console.log("prisma counts", { productCount, userCount, slideCount, galleryCount, pageCount, leadCount });
    console.log(
      "admin login-ready users",
      adminUsers.map((user) => ({
        email: user.email,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        locked: Boolean(user.lockedUntil && user.lockedUntil > new Date()),
      })),
    );

    if (mismatch || urlDiff || galleryDiff) {
      console.log("\nVERIFY RESULT: ISSUES FOUND");
      process.exitCode = 1;
    } else {
      console.log("\nVERIFY RESULT: OK");
    }
  } finally {
    await prisma.$disconnect().catch(() => undefined);
    await source.end().catch(() => undefined);
    await target.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
