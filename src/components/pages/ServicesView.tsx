import { Compass, Handshake, Wrench, Headphones, GearSix } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import PageBanner from "@/components/pages/PageBanner";
import { parseServicesConfig, type PublicPageContent } from "@/lib/page-cms";

function serviceIcon(title: string): Icon {
  const value = title.toLowerCase();
  if (
    value.includes("konsulen") ||
    value.includes("zgjedh") ||
    value.includes("advice") ||
    value.includes("selection") ||
    value.includes("danışman") ||
    value.includes("seçim")
  )
    return Compass;
  if (value.includes("shitje") || value.includes("sales") || value.includes("satış")) return Handshake;
  if (
    value.includes("pjes") ||
    value.includes("këmbim") ||
    value.includes("kembim") ||
    value.includes("spare") ||
    value.includes("parts") ||
    value.includes("yedek") ||
    value.includes("parça")
  )
    return Wrench;
  if (
    value.includes("mbështet") ||
    value.includes("mbeshtet") ||
    value.includes("teknik") ||
    value.includes("support") ||
    value.includes("destek")
  )
    return Headphones;
  if (value.includes("servis") || value.includes("service")) return GearSix;
  return GearSix;
}

export default function ServicesView({ page }: { page: PublicPageContent }) {
  const config = parseServicesConfig(page.config);
  const items = config.items.filter((item) => item.isActive);

  return (
    <div className="bg-ivory pb-20 text-ink">
      <PageBanner page={page} />
      <section className="container-site pt-8 md:pt-12">
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {items.map((service, i) => {
            const Icon = serviceIcon(service.title);
            return (
              <Reveal key={service.id} delay={i * 0.05} y={20}>
                <article className="grid gap-5 py-10 md:grid-cols-12 md:gap-10 md:py-12">
                  <div className="md:col-span-5">
                    <p className="font-display text-sm tabular-nums text-tractor-red">{String(i + 1).padStart(2, "0")}</p>
                    <div className="mt-3 flex items-start gap-3">
                      <Icon size={22} className="mt-1 shrink-0 text-tractor-red" />
                      <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{service.title}</h2>
                    </div>
                  </div>
                  <p className="max-w-[54ch] text-base leading-relaxed text-ink/65 md:col-span-7 md:pt-8">{service.body}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-10">
          <Button href={config.ctaHref || "/kontakt"} variant="primary" arrow>
            {config.ctaLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
