import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/motion/Reveal";

export default function CategoryExperience() {
  return (
    <section className="mt-20 md:mt-28">
      <div className="grid min-h-[85dvh] lg:grid-cols-2">
        <CategoryPanel
          href="/traktoret"
          image="/images/home/category-tractors.jpg"
          title="Traktorët"
          body="Nga pemishtet deri te puna e rëndë në fushë."
          cta="Eksploro modelet"
        />
        <CategoryPanel
          href="/makineri-bujqesore"
          image="/images/home/category-equipment.jpg"
          title="Makineri Bujqësore"
          body="Kultivatorë, rotovatorë, plugje dhe pajisje për çdo sezon."
          cta="Shiko makineritë"
          delay={0.08}
        />
      </div>
    </section>
  );
}

function CategoryPanel({
  href,
  image,
  title,
  body,
  cta,
  delay = 0,
}: {
  href: string;
  image: string;
  title: string;
  body: string;
  cta: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} y={0} className="h-full">
      <Link href={href} className="group relative block min-h-[70vh] overflow-hidden lg:min-h-[85dvh]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-warm md:text-6xl">
            {title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-warm/75 md:text-base">{body}</p>
          <span className="mt-6 inline-flex items-center gap-3 text-[12px] font-semibold tracking-[0.14em] uppercase text-gold">
            {cta}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={16} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
