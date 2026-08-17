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
    <section className="bg-graphite py-16 text-warm md:py-20">
      <Reveal>
        <div className="container-site grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <p className="text-[13px] tracking-[0.16em] uppercase text-tractor-red">{section.eyebrow || "Kontakt"}</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-tight">
              {section.title || settings.companyName}
            </h2>
            {section.body ? <p className="mt-4 max-w-md text-base text-warm/65">{section.body}</p> : null}
          </div>
          <div className="space-y-3 text-base text-warm/80">
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
            <p>{settings.location}</p>
            <div className="pt-3">
              <Button href={section.ctaHref || "/kontakt"} variant="secondary" arrow>
                {section.ctaLabel || "Na Kontaktoni"}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
