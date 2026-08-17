import { redirect } from "next/navigation";

export default async function CategoryPageRedirect({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (category === "TRACTOR") redirect("/admin/pages/tractors");
  if (category === "EQUIPMENT") redirect("/admin/pages/equipment");
  redirect("/admin/pages");
}
