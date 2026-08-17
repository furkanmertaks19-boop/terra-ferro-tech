import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { clientIp } from "@/lib/rate-limit";

const REDACT = new Set(["password", "passwordHash", "currentPassword", "newPassword", "token", "secret", "apiSecret"]);

function scrub(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(scrub);
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT.has(key) ? "[redacted]" : scrub(item);
  }
  return out;
}

export async function writeAudit(input: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const headerList = await headers();
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? (scrub(input.metadata) as object) : undefined,
        ipAddress: clientIp(headerList),
        userAgent: headerList.get("user-agent")?.slice(0, 300) ?? null,
      },
    });
  } catch (error) {
    console.error("[audit]", error instanceof Error ? error.message : "failed");
  }
}
