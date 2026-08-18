import type { Metadata } from "next";
import { Category } from "@prisma/client";
import { getProductList, parseListFilters } from "@/lib/products";
import { getPublishedPage } from "@/lib/pages";
import EquipmentListing from "@/components/catalog/EquipmentListing";
import { PAGE_SEO, publicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata(PAGE_SEO.equipment);
}

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseListFilters(params);
  const [list, page] = await Promise.all([getProductList(Category.EQUIPMENT, filters), getPublishedPage("equipment")]);

  return (
    <EquipmentListing
      hero={page}
      products={list.products}
      subcategoryOptions={list.subcategoryOptions}
      group={filters.group}
      subcategory={filters.subcategory}
    />
  );
}
