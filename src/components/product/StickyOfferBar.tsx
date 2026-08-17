"use client";

import QuoteButton from "./QuoteButton";

import { useProductView } from "./ProductViewContext";

export default function StickyOfferBar({
  productId,
  productLabel,
}: {
  productId: string;
  productLabel: string;
}) {
  const { preview } = useProductView();
  if (preview) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-ink/10 bg-ivory/95 p-3 lg:hidden">
      <QuoteButton productId={productId} productLabel={productLabel} className="w-full py-3.5" />
    </div>
  );
}
