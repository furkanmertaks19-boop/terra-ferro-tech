import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { productHref } from "@/lib/product-path";
import { coverUrl, type PublicProduct } from "@/lib/types";
import ProductBadges from "./ProductBadges";
import QuoteButton from "./QuoteButton";
import { productImageAlt } from "@/lib/seo";

export default function TractorCard({ product }: { product: PublicProduct; index?: number }) {
  const cover = coverUrl(product);
  const parts = [
    product.horsePower != null ? `${product.horsePower} HP` : null,
    product.hasCabin ? "Kabinë" : "ROPS",
    product.stage,
  ].filter(Boolean);

  return (
    <article className="group flex h-full flex-col border border-ink/10 bg-warm-white transition-[border-color] duration-300 ease-out-expo hover:border-tractor-red/45">
      <Link href={productHref(product)} className="flex flex-1 flex-col">
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
              className="object-contain p-5 transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-[13px] tracking-[0.16em] uppercase text-ink/35">Terra Ferro Tech</p>
              <p className="text-sm text-ink/40">Imazhi së shpejti</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 py-5">
          {product.series ? (
            <p className="text-[13px] font-medium tracking-[0.16em] uppercase text-tractor-red">{product.series}</p>
          ) : null}
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{product.name}</h3>
          <p className="mt-1 text-base text-ink/55">{parts.join(" · ")}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[13px] font-semibold tracking-[0.12em] uppercase">
            Shiko Modelin
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
      <div className="border-t border-ink/10 px-5 py-3">
        <QuoteButton productId={product.id} productLabel={product.fullTitle} className="w-full" />
      </div>
    </article>
  );
}
