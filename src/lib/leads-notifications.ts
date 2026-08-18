import { prisma, withPrismaRetry } from "@/lib/prisma";

export type LeadNotification = {
  id: string;
  name: string;
  productName: string | null;
  createdAt: string;
  href: string;
};

export async function getUnreadLeadCount(): Promise<number> {
  try {
    return await withPrismaRetry(() => prisma.lead.count({ where: { readAt: null } }));
  } catch {
    return 0;
  }
}

export async function getUnreadLeadNotifications(take = 8): Promise<LeadNotification[]> {
  try {
    const rows = await withPrismaRetry(() =>
      prisma.lead.findMany({
        where: { readAt: null },
        orderBy: { createdAt: "desc" },
        take,
        select: {
          id: true,
          name: true,
          createdAt: true,
          product: { select: { name: true } },
          usedTractor: { select: { brand: true, model: true } },
        },
      }),
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      productName: row.product?.name ?? (row.usedTractor ? `${row.usedTractor.brand} ${row.usedTractor.model}` : null),
      createdAt: row.createdAt.toISOString(),
      href: `/admin/leads?open=${row.id}`,
    }));
  } catch {
    return [];
  }
}

export async function markLeadRead(id: string) {
  await prisma.lead.updateMany({
    where: { id, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllLeadsRead() {
  await prisma.lead.updateMany({
    where: { readAt: null },
    data: { readAt: new Date() },
  });
}
