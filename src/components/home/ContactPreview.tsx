import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { HomeSectionRecord } from "@/lib/home-section-types";
import type { PublicSiteSettings } from "@/lib/site-settings";

export default function ContactPreview({
  section,
  settings,
}: {
  section: HomeSectionRecord;
  settings: PublicSiteSettings;
}) {
  return (
    <section className="border-t border-ink/8 bg-ivory py-16 text-ink md:py-20">
      <Reveal>
        <div className="container-site grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-tractor-red">{section.eyebrow || "Kontakt"}</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-tight">
              {section.title || settings.companyName}
            </h2>
            {section.body ? <p className="mt-4 max-w-md text-base text-ink/65">{section.body}</p> : null}
          </div>
          <div className="space-y-3 text-base text-ink/80">
            <a href={`tel:${settings.phoneHref}`} className="block hover:text-tractor-red">
              {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`} className="block hover:text-tractor-red">
              {settings.email}
            </a>
            <p>{settings.location}</p>
            <div className="pt-3">
              <Button href={section.ctaHref || "/kontakt"} variant="dark" arrow>
                {section.ctaLabel || "Na Kontaktoni"}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
