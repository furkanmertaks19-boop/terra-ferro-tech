import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  reset: Promise<void> | null;
};

function pgConnectionString() {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL gerekli.");

  try {
    const url = new URL(raw);
    const sslmode = url.searchParams.get("sslmode");
    url.search = "";
    if (sslmode) url.searchParams.set("sslmode", sslmode);
    return url.toString();
  } catch {
    return raw
      .replace(/([?&])(pgbouncer|connection_limit|pool_timeout|connect_timeout|max_idle_connection_lifetime|socket_timeout)=[^&]*&?/g, "$1")
      .replace(/[?&]$/, "");
  }
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg(
      {
        connectionString: pgConnectionString(),
        max: 5,
        idleTimeoutMillis: 10,
        connectionTimeoutMillis: 10_000,
        allowExitOnIdle: true,
      },
      {
        onPoolError: () => {
          globalForPrisma.prisma = undefined;
        },
      },
    ),
  });
}

function getClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export async function resetPrismaClient() {
  if (globalForPrisma.reset) return globalForPrisma.reset;

  const job = (async () => {
    const previous = globalForPrisma.prisma;
    globalForPrisma.prisma = createPrismaClient();
    if (previous) {
      await previous.$disconnect().catch(() => undefined);
    }
  })().finally(() => {
    if (globalForPrisma.reset === job) globalForPrisma.reset = null;
  });

  globalForPrisma.reset = job;
  return job;
}

export function isDbConnectionError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    code === "P1001" ||
    code === "P1008" ||
    code === "P1017" ||
    code === "08P01" ||
    /closed the connection|Connection terminated|ECONNRESET|ECONNREFUSED|Can't reach database|prepared statement|bind message supplies|Engine is not yet connected|Response from the Engine was empty|Cannot use a pool after calling end|timeout exceeded when trying to connect/i.test(
      message,
    )
  );
}

export async function withPrismaRetry<T>(fn: () => Promise<T>): Promise<T> {
  if (globalForPrisma.reset) await globalForPrisma.reset;

  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isDbConnectionError(error) || attempt === 3) throw error;
      await resetPrismaClient();
      await new Promise((resolve) => setTimeout(resolve, 80 * attempt));
    }
  }

  throw lastError;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (prop === "then") return undefined;
    const client = getClient();
    return Reflect.get(client, prop, client);
  },
});
