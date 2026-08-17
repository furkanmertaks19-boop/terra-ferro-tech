import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env");
loadEnv(".env.local");

function pgUrl() {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL veya DIRECT_URL gerekli.");
  return raw.replace(/([?&])pgbouncer=true&?/, "$1").replace(/[?&]$/, "");
}

async function main() {
  const password = process.env.TEMP_ADMIN_PASSWORD;
  const username = (process.env.TEMP_ADMIN_USERNAME || "admin").trim();
  const email = (process.env.TEMP_ADMIN_EMAIL || `${username}@terraferrotech.local`).trim().toLowerCase();
  const name = process.env.TEMP_ADMIN_NAME?.trim() || "Admin";
  if (!password) {
    console.error("TEMP_ADMIN_PASSWORD gerekli.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: pgUrl() });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const existing = await pool.query(
      'SELECT id FROM "User" WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email]
    );
    if (existing.rowCount) {
      await pool.query(
        `UPDATE "User" SET
          name = $2,
          email = $3,
          username = $4,
          "passwordHash" = $5,
          role = 'SUPER_ADMIN',
          "isActive" = true,
          "mustChangePassword" = true,
          "failedLoginAttempts" = 0,
          "lockedUntil" = NULL,
          "sessionVersion" = "sessionVersion" + 1,
          "updatedAt" = NOW()
        WHERE id = $1`,
        [existing.rows[0].id, name, email, username, passwordHash]
      );
      console.info(`Mevcut kullanıcı güncellendi: ${username}`);
    } else {
      await pool.query(
        `INSERT INTO "User" (
          id, name, email, username, "passwordHash", role, "isActive",
          "mustChangePassword", "failedLoginAttempts", "passwordChangedAt",
          "sessionVersion", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, 'SUPER_ADMIN', true,
          true, 0, NOW(),
          1, NOW(), NOW()
        )`,
        [randomUUID(), name, email, username, passwordHash]
      );
      console.info(`SUPER_ADMIN oluşturuldu: ${username}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Oluşturma başarısız.");
  process.exit(1);
});
