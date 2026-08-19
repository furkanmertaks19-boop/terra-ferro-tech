import { prisma, withPrismaRetry } from "@/lib/prisma";
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

  let leads: Awaited<ReturnType<typeof fetchLeads>> = [];
  let fetchError: string | null = null;

  try {
    leads = await fetchLeads();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[AdminLeadsPage] DB error:", msg);
    fetchError = msg;
  }

  if (fetchError) {
    return (
      <div className="admin-panel p-6 text-center space-y-2">
        <p className="font-display text-2xl text-[var(--admin-danger)]">Veritabanı hatası</p>
        <p className="text-sm text-[var(--admin-text-2)]">
          Teklif talepleri yüklenemedi. Supabase migration'larının uygulandığından emin olun.
        </p>
        <pre className="mt-3 text-left text-xs bg-[var(--admin-bg-2)] p-3 rounded overflow-x-auto text-[var(--admin-danger)]">
          {fetchError}
        </pre>
      </div>
    );
  }

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

function fetchLeads() {
  return withPrismaRetry(() =>
    prisma.lead.findMany({
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
        locale: true,
      },
    }),
  );
}
