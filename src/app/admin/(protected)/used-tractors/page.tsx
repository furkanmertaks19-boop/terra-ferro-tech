import { prisma } from "@/lib/prisma";
import UsedTractorsWorkspace from "@/components/admin/used-tractors/UsedTractorsWorkspace";
import { getCurrentUser } from "@/lib/authz";
import { ADMIN_ROLES } from "@/lib/roles";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export default async function AdminUsedTractorsPage() {
  const [user, settings, rows] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
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
  ]);

  return (
    <UsedTractorsWorkspace
      enabled={settings.usedTractorsEnabled}
      canToggle={Boolean(user && ADMIN_ROLES.includes(user.role))}
      canDelete={Boolean(user && ADMIN_ROLES.includes(user.role))}
      items={rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }))}
    />
  );
}
