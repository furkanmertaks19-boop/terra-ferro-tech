import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import PageHero from "@/components/pages/PageHero";
import { parseAboutConfig, type PublicPageContent } from "@/lib/page-cms";
import type { PublicSiteSettings } from "@/lib/site-settings";

export default function AboutView({
  page,
  settings,
}: {
  page: PublicPageContent;
  settings: PublicSiteSettings;
}) {
  const config = parseAboutConfig(page.config);
  const features = config.features.filter((item) => item.isActive);

  return (
    <div>
      <PageHero page={page} />
      <section className="bg-ink py-20 md:py-28">
        <div className="container-site grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h2 className="font-display text-3xl font-semibold text-warm md:text-4xl">{config.introTitle}</h2>
            {config.introImage ? (
              <div className="relative mt-8 aspect-[4/3] overflow-hidden bg-ink-2">
                <Image src={config.introImage} alt="" fill className="object-cover" sizes="(min-width: 1024px) 40vw, 100vw" />
              </div>
            ) : null}
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7">
            {config.introBody ? <p className="max-w-[58ch] text-base leading-relaxed text-warm/75">{config.introBody}</p> : null}
            {features.length > 0 ? (
              <ul className="mt-10 space-y-6">
                {features.map((item) => (
                  <li key={item.id} className="border-t border-warm/10 pt-5">
                    <h3 className="text-lg font-medium text-warm">{item.title}</h3>
                    <p className="mt-1 text-sm text-warm/60">{item.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        </div>
      </section>
      <section className="border-t border-warm/10 bg-ink-2 py-20">
        <div className="container-site flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-warm">{config.ctaTitle}</h2>
            <p className="mt-3 max-w-md text-sm text-warm/65">{settings.location}</p>
          </div>
          <Button href={config.ctaHref || "/kontakt"} variant="primary" arrow>
            {config.ctaLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
