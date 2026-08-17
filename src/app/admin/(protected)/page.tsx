import Link from "next/link";
import { prisma, withPrismaRetry } from "@/lib/prisma";
import { Category, ProductStatus } from "@prisma/client";
import { Package, Tractor, GearSix, ChatCircleDots } from "@phosphor-icons/react/ssr";

export const dynamic = "force-dynamic";

function isEmptySpecs(specs: unknown) {
  return !specs || (typeof specs === "object" && !Array.isArray(specs) && Object.keys(specs as object).length === 0);
}

export default async function AdminDashboard() {
  const [products, leads, newLeads, recentLeads] = await withPrismaRetry(() =>
    prisma.$transaction([
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          createdAt: true,
          status: true,
          images: true,
          coverImage: true,
          description: true,
          shortDescription: true,
          specs: true,
        },
      }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { name: true } } },
      }),
    ]),
  ).catch(() => [[], 0, 0, []] as const);

  const total = products.length;
  const tractors = products.filter((p) => p.category === Category.TRACTOR).length;
  const equipment = products.filter((p) => p.category === Category.EQUIPMENT).length;
  const drafts = products.filter((p) => p.status === ProductStatus.DRAFT).length;
  const noImage = products.filter((p) => p.images.length === 0 && !p.coverImage).length;
  const noDesc = products.filter((p) => !p.description && !p.shortDescription).length;
  const noSpecs = products.filter((p) => isEmptySpecs(p.specs)).length;
  const recentProducts = products.slice(0, 5);

  const kpis = [
    { label: "Toplam Ürün", value: total, hint: `${tractors} Traktör · ${equipment} Makine`, href: "/admin/products", icon: Package },
    { label: "Traktör", value: tractors, hint: "Katalog", href: "/admin/products?category=TRACTOR", icon: Tractor },
    { label: "Tarım Makinesi", value: equipment, hint: "Ataşmanlar", href: "/admin/products?category=EQUIPMENT", icon: GearSix },
    { label: "Yeni Teklifler", value: newLeads, hint: `${leads} toplam talep`, href: "/admin/leads", icon: ChatCircleDots },
  ];

  const tractorPct = total ? Math.round((tractors / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="admin-glass rounded-[14px] p-5 transition hover:border-[var(--admin-accent)]">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--admin-muted)]">{card.label}</p>
                <Icon size={18} className="text-[var(--admin-accent)]" />
              </div>
              <p className="mt-3 font-display text-4xl font-semibold">{card.value}</p>
              <p className="mt-1 text-sm text-[var(--admin-text-2)]">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">+ Yeni Ürün</Link>
        <Link href="/admin/products/new?category=TRACTOR" className="admin-btn admin-btn-ghost">+ Yeni Traktör</Link>
        <Link href="/admin/products/new?category=EQUIPMENT" className="admin-btn admin-btn-ghost">+ Yeni Tarım Makinesi</Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="admin-panel p-5 xl:col-span-1">
          <h2 className="text-sm font-semibold">Ürün dağılımı</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--admin-bg-3)]">
            <div className="h-full bg-[var(--admin-accent)]" style={{ width: `${tractorPct}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--admin-text-2)]">
            %{tractorPct} traktör · %{total ? 100 - tractorPct : 0} tarım makinesi
          </p>
        </section>

        <section className="admin-panel p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Eksik içerikler</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <Gap href="/admin/products?status=DRAFT" label="Taslak ürün" value={drafts} />
            <Gap href="/admin/products" label="Fotoğrafı olmayan" value={noImage} />
            <Gap href="/admin/products" label="Açıklaması olmayan" value={noDesc} />
            <Gap href="/admin/products" label="Teknik özellik eksik" value={noSpecs} />
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-panel p-5">
          <h2 className="text-sm font-semibold">Son eklenen ürünler</h2>
          <ul className="mt-3 divide-y divide-[var(--admin-border)]">
            {recentProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/admin/products/${p.id}`} className="hover:text-[var(--admin-accent-2)]">{p.name}</Link>
                <span className="text-[var(--admin-muted)]">{p.category === "TRACTOR" ? "Traktör" : "Makine"}</span>
              </li>
            ))}
            {recentProducts.length === 0 && <li className="py-6 text-sm text-[var(--admin-muted)]">Henüz ürün yok.</li>}
          </ul>
        </section>
        <section className="admin-panel p-5">
          <h2 className="text-sm font-semibold">Son teklif talepleri</h2>
          <ul className="mt-3 divide-y divide-[var(--admin-border)]">
            {recentLeads.map((l) => (
              <li key={l.id} className="py-2.5 text-sm">
                <p>{l.name}</p>
                <p className="text-[var(--admin-muted)]">{l.product?.name ?? "Genel talep"}</p>
              </li>
            ))}
            {recentLeads.length === 0 && <li className="py-6 text-sm text-[var(--admin-muted)]">Henüz teklif yok.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Gap({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-[8px] border border-[var(--admin-border)] px-3 py-2 text-sm">
      <span className="text-[var(--admin-text-2)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </Link>
  );
}
