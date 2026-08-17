import Link from "next/link";
import { catalogHref } from "@/lib/product-path";
import { Category } from "@prisma/client";

export default function ProductBreadcrumb({
  category,
  name,
  tone = "dark",
}: {
  category: Category;
  name: string;
  tone?: "dark" | "light";
}) {
  const catalog = category === Category.TRACTOR ? "Traktorët" : "Makineri Bujqësore";
  const muted = tone === "light" ? "text-ink/45" : "text-warm/50";
  const hover = tone === "light" ? "hover:text-ink" : "hover:text-tractor-red";
  const current = tone === "light" ? "text-ink" : "text-warm/80";

  return (
    <nav aria-label="Shtegu" className={`text-[12px] tracking-[0.04em] ${muted}`}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className={hover}>
            Ballina
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href={catalogHref(category)} className={hover}>
            {catalog}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className={current}>{name}</li>
      </ol>
    </nav>
  );
}
