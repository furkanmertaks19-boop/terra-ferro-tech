import { prisma } from "@/lib/prisma";
import LeadsWorkspace from "@/components/admin/leads/LeadsWorkspace";
import { getCurrentUser } from "@/lib/authz";
import { ADMIN_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const open = Array.isArray(params.open) ? params.open[0] : params.open;
  const user = await getCurrentUser();
  const canDelete = Boolean(user && ADMIN_ROLES.includes(user.role));
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      message: true,
      status: true,
      readAt: true,
      createdAt: true,
      product: { select: { name: true, slug: true, category: true } },
      usedTractor: { select: { id: true, brand: true, model: true, slug: true } },
    },
  });

  return (
    <LeadsWorkspace
      canDelete={canDelete}
      initialOpenId={open ?? null}
      leads={leads.map((lead) => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        readAt: lead.readAt ? lead.readAt.toISOString() : null,
      }))}
    />
  );
}
