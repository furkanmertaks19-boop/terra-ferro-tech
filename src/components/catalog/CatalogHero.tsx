import Image from "next/image";
import type { PublicCategoryPage } from "@/lib/category-page-types";

export default function CatalogHero({ page }: { page: PublicCategoryPage }) {
  const overlay = Math.min(0.8, Math.max(0, page.overlayOpacity / 100));
  const centered = page.textPosition === "center";
  const desktop = page.desktopImage;
  const mobile = page.mobileImage;

  return (
    <section className="relative min-h-[400px] overflow-hidden bg-ink text-warm md:min-h-[520px]">
      {desktop ? (
        <Image
          src={desktop}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`object-cover object-[center_30%] ${mobile ? "hidden md:block" : ""}`}
        />
      ) : null}
      {mobile ? (
        <Image src={mobile} alt="" fill priority sizes="100vw" className="object-cover object-center md:hidden" />
      ) : null}
      <div
        className={`absolute inset-0 ${
          centered
            ? "bg-gradient-to-t from-ink/70 via-ink/30 to-ink/20"
            : "bg-gradient-to-r from-ink/78 via-ink/35 to-ink/10"
        }`}
        style={{ opacity: Math.max(overlay, 0.4) }}
      />

      <div
        className={`container-site relative z-[1] flex min-h-[400px] items-center pb-10 pt-28 md:min-h-[520px] md:pb-12 ${
          centered ? "justify-center text-center" : ""
        }`}
      >
        <div className={centered ? "max-w-3xl" : "max-w-xl"}>
          {page.eyebrow ? (
            <p className="text-[13px] font-medium tracking-[0.18em] uppercase text-warm/70">{page.eyebrow}</p>
          ) : null}
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-semibold leading-[0.92] tracking-tight">
            {page.title}
          </h1>
          {page.subtitle ? (
            <p className="mt-4 max-w-lg text-base leading-relaxed text-warm/80 md:text-lg">{page.subtitle}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
