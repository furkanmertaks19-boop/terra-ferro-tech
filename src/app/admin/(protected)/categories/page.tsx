import CategoriesWorkspace from "@/components/admin/categories/CategoriesWorkspace";
import { listProductCategories } from "@/lib/product-categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const trees = await listProductCategories();
  return <CategoriesWorkspace trees={trees} />;
}
