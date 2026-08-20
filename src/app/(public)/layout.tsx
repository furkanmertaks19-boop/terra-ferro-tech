import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import ShikoCursor from "@/components/layout/ShikoCursor";
import { QuoteProvider } from "@/components/quote/QuoteProvider";
import QuoteModal from "@/components/quote/QuoteModal";
import { getSiteSettings } from "@/lib/site-settings-data";
import { getRequestLocale } from "@/lib/i18n/request";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getRequestLocale()]);

  return (
    <LocaleProvider locale={locale} key={locale}>
      <QuoteProvider contact={settings}>
        <div className="flex min-h-dvh flex-col overflow-x-hidden bg-ivory text-ink">
          <ScrollProgress />
          <Header settings={settings} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} locale={locale} />
          <QuoteModal />
          <ShikoCursor />
          <div className="public-grain" aria-hidden />
        </div>
      </QuoteProvider>
    </LocaleProvider>
  );
}
