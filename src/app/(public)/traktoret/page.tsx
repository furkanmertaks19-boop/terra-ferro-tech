import type { Metadata } from "next";
import { Category } from "@prisma/client";
import { getProductList, parseListFilters } from "@/lib/products";
import { getPublishedPage } from "@/lib/pages";
import TractorsListing from "@/components/catalog/TractorsListing";
import { localePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return localePageMetadata("traktoret");
}

export default async function TractorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseListFilters(params);
  const [list, page] = await Promise.all([getProductList(Category.TRACTOR, filters), getPublishedPage("tractors")]);

  return (
    <TractorsListing
      hero={page}
      products={list.products}
      seriesOptions={list.seriesOptions}
      stageOptions={list.stageOptions}
    />
  );
}
