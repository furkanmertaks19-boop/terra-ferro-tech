import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import PageHero from "@/components/pages/PageHero";
import { parseServicesConfig, type PublicPageContent } from "@/lib/page-cms";

export default function ServicesView({ page }: { page: PublicPageContent }) {
  const config = parseServicesConfig(page.config);
  const items = config.items.filter((item) => item.isActive);

  return (
    <div className="bg-ink pb-24">
      <PageHero page={page} />
      <section className="container-site pt-10 md:pt-14">
        <div className="divide-y divide-warm/10 border-y border-warm/10">
          {items.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.04}>
              <article className="grid gap-4 py-10 md:grid-cols-12">
                <div className="md:col-span-5">
                  <h2 className="font-display text-2xl font-semibold text-warm md:text-3xl">{service.title}</h2>
                  {service.image ? (
                    <div className="relative mt-4 aspect-[16/10] overflow-hidden bg-ink-2">
                      <Image src={service.image} alt="" fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
                    </div>
                  ) : null}
                </div>
                <p className="max-w-[52ch] text-sm leading-relaxed text-warm/65 md:col-span-7 md:text-base">{service.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-12">
          <Button href={config.ctaHref || "/kontakt"} variant="primary" arrow>
            {config.ctaLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
