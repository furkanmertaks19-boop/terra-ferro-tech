import { prisma, withPrismaRetry } from "@/lib/prisma";
import UsedTractorsWorkspace from "@/components/admin/used-tractors/UsedTractorsWorkspace";
import { getCurrentUser } from "@/lib/authz";
import { ADMIN_ROLES } from "@/lib/roles";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export default async function AdminUsedTractorsPage() {
  const [user, settings] = await Promise.all([getCurrentUser(), getSiteSettings()]);

  let rows: Awaited<ReturnType<typeof fetchUsedTractors>> = [];
  let fetchError: string | null = null;

  try {
    rows = await fetchUsedTractors();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[AdminUsedTractorsPage] DB error:", msg);
    fetchError = msg;
  }

  if (fetchError) {
    return (
      <div className="admin-panel p-6 text-center space-y-2">
        <p className="font-display text-2xl text-[var(--admin-danger)]">Veritabanı hatası</p>
        <p className="text-sm text-[var(--admin-text-2)]">
          2. el traktörler yüklenemedi. Supabase migration'larının uygulandığından emin olun.
        </p>
        <pre className="mt-3 text-left text-xs bg-[var(--admin-bg-2)] p-3 rounded overflow-x-auto text-[var(--admin-danger)]">
          {fetchError}
        </pre>
      </div>
    );
  }

  return (
    <UsedTractorsWorkspace
      enabled={settings.usedTractorsEnabled}
      canToggle={Boolean(user && ADMIN_ROLES.includes(user.role))}
      canDelete={Boolean(user && ADMIN_ROLES.includes(user.role))}
      items={rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }))}
    />
  );
}

function fetchUsedTractors() {
  return withPrismaRetry(() =>
    prisma.usedTractor.findMany({
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true,
        brand: true,
        model: true,
        slug: true,
        year: true,
        hours: true,
        horsePower: true,
        status: true,
        coverImage: true,
        images: true,
        updatedAt: true,
      },
    }),
  );
}
