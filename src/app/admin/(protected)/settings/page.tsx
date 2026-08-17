import { getSiteSettings } from "@/lib/site-settings-data";
import SettingsForm from "@/components/admin/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Firma Bilgileri</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">Public sitedeki iletişim, konum ve harita bilgilerini yönetin.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
