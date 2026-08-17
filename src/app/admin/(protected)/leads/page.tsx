import { prisma } from "@/lib/prisma";
import LeadsWorkspace from "@/components/admin/leads/LeadsWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true, category: true } } },
  });

  return (
    <LeadsWorkspace
      leads={leads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
      }))}
    />
  );
}
