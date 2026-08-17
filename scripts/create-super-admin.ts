import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { passwordPolicyError } from "../src/lib/password";

const BCRYPT_COST = 12;

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

async function prompt(question: string) {
  const rl = createInterface({ input, output });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function main() {
  let email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  let password = process.env.SUPER_ADMIN_PASSWORD ?? "";
  let name = process.env.SUPER_ADMIN_NAME?.trim() || "";

  if (!email || !password) {
    if (!process.stdin.isTTY) {
      console.error("SUPER_ADMIN_EMAIL ve SUPER_ADMIN_PASSWORD ortam değişkenlerini ayarlayın.");
      process.exit(1);
    }
    if (!name) name = (await prompt("Ad soyad: ")) || "Super Admin";
    if (!email) email = (await prompt("E-posta: ")).toLowerCase();
    if (!password) password = await prompt("Şifre (en az 12 karakter): ");
  }
  if (!name) name = "Super Admin";

  if (!email.includes("@")) {
    console.error("Geçerli bir e-posta gerekli.");
    process.exit(1);
  }
  const policy = passwordPolicyError(password, [email, name, email.split("@")[0] ?? ""]);
  if (policy) {
    console.error(policy);
    process.exit(1);
  }

  const pool = new Pool({ connectionString: pgUrl() });
  try {
    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [email]);
    if (existing.rowCount) {
      console.error("Bu e-posta ile kullanıcı zaten var.");
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    await pool.query(
      `INSERT INTO "User" (
        id, name, email, username, "passwordHash", role, "isActive",
        "mustChangePassword", "failedLoginAttempts", "passwordChangedAt",
        "sessionVersion", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, NULL, $4, 'SUPER_ADMIN', true,
        true, 0, NOW(),
        1, NOW(), NOW()
      )`,
      [randomUUID(), name, email, passwordHash]
    );
    console.info(`SUPER_ADMIN oluşturuldu: ${email}`);
    console.info("Giriş: /admin/login — ilk girişte yeni şifre belirlenecek.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Oluşturma başarısız.");
  process.exit(1);
});
