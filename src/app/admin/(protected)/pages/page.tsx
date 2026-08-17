import Link from "next/link";
import Image from "next/image";
import { listAdminPages } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await listAdminPages();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Sayfalar</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">Public sayfa içeriklerini ve hero alanlarını yönetin.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pages.map((page) => (
          <article key={page.key} className="admin-panel overflow-hidden">
            <div className="relative aspect-[16/8] bg-ink text-warm">
              {page.heroImage ? (
                <Image src={page.heroImage} alt="" fill className="object-cover" sizes="420px" />
              ) : null}
              <div className="absolute inset-0 bg-ink/45" />
              <p className="absolute bottom-3 left-4 font-display text-2xl text-warm">{page.publicName}</p>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="font-medium">{page.adminTitle}</p>
                <p className="text-sm text-[var(--admin-text-2)]">{page.path}</p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">{page.summary}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-[var(--admin-text-2)]">
                  <p>Son güncelleme: {page.updatedAt ? page.updatedAt.toLocaleString("tr-TR") : "—"}</p>
                  <p className={page.hasUnpublishedChanges ? "text-amber-300" : ""}>
                    {page.hasUnpublishedChanges ? "Yayınlanmamış değişiklik" : "Yayında"}
                  </p>
                </div>
                <Link href={`/admin/pages/${page.key}`} className="admin-btn admin-btn-primary min-h-9 px-4 text-sm">
                  Düzenle
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
