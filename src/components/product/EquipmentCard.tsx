import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { productHref, publicSubcategoryLabel } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import ProductBadges from "./ProductBadges";
import QuoteButton from "./QuoteButton";
import { productImageAlt } from "@/lib/seo";

function specValue(specs: Record<string, string>, ...keys: string[]) {
  const entries = Object.entries(specs);
  for (const key of keys) {
    const exact = specs[key];
    if (exact) return exact;
    const found = entries.find(([k]) => k.toLowerCase().includes(key.toLowerCase()));
    if (found?.[1]) return found[1];
  }
  return null;
}

function highlight(product: PublicProduct) {
  const specs = product.specs ?? {};
  const parts = [
    specValue(specs, "Gjerësia e punës", "gjerësia", "width"),
    specValue(specs, "HP e nevojshme", "HP"),
    specValue(specs, "Kapaciteti", "kapacitet"),
  ].filter(Boolean);
  return parts.slice(0, 2).join(" · ");
}

export default function EquipmentCard({ product }: { product: PublicProduct; index?: number }) {
  const cover = coverUrl(product);
  const meta = publicSubcategoryLabel(product.subcategory) || product.series;
  const line = highlight(product);

  return (
    <article className="group flex h-full min-w-0 flex-col border border-ink/10 bg-warm-white transition-[border-color] duration-300 ease-out-expo hover:border-tractor-red/45">
      <Link href={productHref(product)} className="flex min-w-0 flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e3d8]">
          <ProductBadges
            isNew={product.isNew}
            isCampaign={product.isCampaign}
            customBadge={product.customBadge}
            customBadgeTone={product.customBadgeTone}
          />
          {cover ? (
            <Image
              src={cover}
              alt={productImageAlt(product)}
              fill
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 100vw"
              className="object-contain object-center p-4 sm:p-5 transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-[13px] tracking-[0.16em] uppercase text-ink/35">Terra Ferro Tech</p>
              <p className="text-sm text-ink/40">Imazhi së shpejti</p>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
          {meta ? (
            <p className="text-[12px] font-medium tracking-[0.16em] uppercase text-tractor-red sm:text-[13px]">{meta}</p>
          ) : null}
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">{product.name}</h3>
          {line ? <p className="mt-1 text-sm text-ink/55 sm:text-base">{line}</p> : null}
          <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[12px] font-semibold tracking-[0.12em] uppercase sm:pt-5 sm:text-[13px]">
            Shiko Modelin
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
      <div className="border-t border-ink/10 px-4 py-3 sm:px-5">
        <QuoteButton productId={product.id} productLabel={product.fullTitle} className="w-full min-w-0 px-3 py-2.5 sm:px-5 sm:py-3" />
      </div>
    </article>
  );
}
