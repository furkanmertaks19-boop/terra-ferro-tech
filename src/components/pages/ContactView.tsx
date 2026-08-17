import PageHero from "@/components/pages/PageHero";
import ContactForm from "@/components/contact/ContactForm";
import { parseContactConfig, type PublicPageContent } from "@/lib/page-cms";
import type { PublicSiteSettings } from "@/lib/site-settings";

export default function ContactView({
  page,
  settings,
}: {
  page: PublicPageContent;
  settings: PublicSiteSettings;
}) {
  const config = parseContactConfig(page.config);

  return (
    <div className="bg-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: settings.companyName,
            email: settings.email,
            telephone: settings.phoneHref,
            address: {
              "@type": "PostalAddress",
              addressLocality: settings.location,
              addressCountry: "AL",
            },
            url: `https://${settings.website}`,
          }),
        }}
      />
      <PageHero page={page} />
      <section className="container-site grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <dl className="space-y-6 text-sm">
            <div>
              <dt className="text-[11px] tracking-[0.18em] uppercase text-warm/45">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${settings.email}`} className="text-tractor-red hover:text-tractor-red-dark">
                  {settings.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.18em] uppercase text-warm/45">Telefon</dt>
              <dd className="mt-1">
                <a href={`tel:${settings.phoneHref}`} className="text-tractor-red hover:text-tractor-red-dark">
                  {settings.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.18em] uppercase text-warm/45">Vendndodhja</dt>
              <dd className="mt-1 text-warm">{settings.location}</dd>
            </div>
          </dl>
        </div>
        <ContactForm labels={config} />
      </section>
      <section className="relative w-full overflow-hidden border-t border-warm/10">
        <div className="h-[min(72vh,600px)] min-h-[520px] w-full">
          <iframe
            src={settings.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title={`${settings.companyName} - ${settings.location}`}
            className="h-full w-full"
          />
        </div>
      </section>
    </div>
  );
}
