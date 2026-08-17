import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ShikoCursor from "@/components/layout/ShikoCursor";
import { QuoteProvider } from "@/components/quote/QuoteProvider";
import QuoteModal from "@/components/quote/QuoteModal";
import { getSiteSettings } from "@/lib/site-settings-data";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <QuoteProvider contact={settings}>
      <div className="flex min-h-dvh flex-col overflow-x-hidden bg-ink">
        <ScrollProgress />
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
        <QuoteModal />
        <ShikoCursor />
        <div className="public-grain" aria-hidden />
      </div>
    </QuoteProvider>
  );
}
