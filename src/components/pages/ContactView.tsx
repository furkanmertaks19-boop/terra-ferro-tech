import PageBanner from "@/components/pages/PageBanner";
import ContactForm from "@/components/contact/ContactForm";
import JsonLd from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { parseContactConfig, type PublicPageContent } from "@/lib/page-cms";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { SITE_NAME, organizationJsonLd } from "@/lib/seo";
import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/ssr";

export default function ContactView({
  page,
  settings,
}: {
  page: PublicPageContent;
  settings: PublicSiteSettings;
}) {
  const config = parseContactConfig(page.config);

  return (
    <div className="bg-ivory text-ink">
      <JsonLd data={organizationJsonLd(settings)} />
      <PageBanner page={page} />
      <section className="container-site grid items-start gap-10 py-10 lg:grid-cols-12 lg:gap-14 lg:py-14" aria-labelledby="contact-details">
        <Reveal className="lg:col-span-5">
          <h2 id="contact-details" className="font-display text-3xl font-semibold tracking-tight">
            {SITE_NAME}
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-ink/60">
            Na shkruani ose na telefononi. Ekipi ynë në Lushnje ju kthen përgjigje sa më shpejt për traktorë, makineri dhe pjesë këmbimi.
          </p>
          <ul className="mt-8 space-y-5">
            <li className="flex gap-4">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center border border-ink/10 bg-white text-tractor-red">
                <EnvelopeSimple size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/40">Email</p>
                <a href={`mailto:${settings.email}`} className="mt-1 block text-base text-ink hover:text-tractor-red">
                  {settings.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center border border-ink/10 bg-white text-tractor-red">
                <Phone size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/40">Telefon</p>
                <a href={`tel:${settings.phoneHref}`} className="mt-1 block text-base text-ink hover:text-tractor-red">
                  {settings.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center border border-ink/10 bg-white text-tractor-red">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-ink/40">Vendndodhja</p>
                <p className="mt-1 text-base text-ink">{settings.location}</p>
              </div>
            </li>
          </ul>
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-7">
          <ContactForm labels={config} />
        </Reveal>
      </section>
      <section className="container-site pb-14 md:pb-16" aria-label="Harta">
        <div className="overflow-hidden border border-ink/10 bg-white">
          <iframe
            src={settings.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Terra Ferro Tech - Lushnje, Albania"
            className="block h-[280px] w-full max-w-full md:h-[420px] lg:h-[460px]"
          />
        </div>
      </section>
    </div>
  );
}
