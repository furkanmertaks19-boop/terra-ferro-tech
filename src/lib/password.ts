import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;
const MIN_LENGTH = 12;
const MAX_LENGTH = 128;

const COMMON = new Set([
  "password",
  "password123",
  "password1234",
  "123456789012",
  "qwertyuiopas",
  "adminadmin12",
  "letmein12345",
  "welcome12345",
  "changeme1234",
  "terraferro12",
  "terraferrotech",
]);

export function passwordPolicyError(password: string, extras: string[] = []) {
  if (password.length < MIN_LENGTH) return `Şifre en az ${MIN_LENGTH} karakter olmalı.`;
  if (password.length > MAX_LENGTH) return `Şifre en fazla ${MAX_LENGTH} karakter olabilir.`;
  if (!password.trim()) return "Şifre boş olamaz.";
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) return "Bu şifre çok yaygın. Daha uzun veya farklı bir ifade kullanın.";
  for (const extra of extras) {
    const value = extra.trim().toLowerCase();
    if (value.length >= 4 && lower.includes(value)) return "Şifre e-posta veya kullanıcı adı içermemeli.";
  }
  return null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
