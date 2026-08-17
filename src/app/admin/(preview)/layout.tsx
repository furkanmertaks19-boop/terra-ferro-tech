import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { QuoteProvider } from "@/components/quote/QuoteProvider";
import QuoteModal from "@/components/quote/QuoteModal";
import { getSiteSettings } from "@/lib/site-settings-data";
import { getCurrentUser } from "@/lib/authz";
import { redirect } from "next/navigation";

export default async function AdminPreviewLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");
  const settings = await getSiteSettings();

  return (
    <QuoteProvider contact={settings}>
      <div className="flex min-h-dvh flex-col overflow-x-hidden bg-ink text-warm">
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <QuoteModal />
        <div className="pointer-events-none fixed bottom-4 left-4 z-[70] rounded-full bg-[#c4962c] px-4 py-2 text-sm font-medium text-[#1a1404] shadow-lg">
          Yönetici önizlemesi — ziyaretçiler bu sayfayı göremez
        </div>
      </div>
    </QuoteProvider>
  );
}
