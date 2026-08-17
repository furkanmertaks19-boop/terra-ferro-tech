"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { uniqueCategorySlug } from "@/lib/product-categories";

async function requireAdmin() {
  await requireContentAccess();
}

function revalidateCats() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/traktoret");
  revalidatePath("/makineri-bujqesore");
  revalidatePath("/");
}

const kindSchema = z.enum(["TRACTOR", "EQUIPMENT"]);

export async function createProductCategory(input: { kind: Category; parentId: string | null; name: string }) {
  await requireAdmin();
  const kind = kindSchema.parse(input.kind);
  const name = input.name.trim();
  if (!name) throw new Error("İsim gerekli");
  const existing = await prisma.productCategory.findMany({ where: { kind }, select: { slug: true } });
  const slug = uniqueCategorySlug(kind, name, existing.map((row) => `${kind}:${row.slug}`));
  const last = await prisma.productCategory.aggregate({
    where: { kind, parentId: input.parentId },
    _max: { sortOrder: true },
  });
  await prisma.productCategory.create({
    data: {
      kind,
      parentId: input.parentId,
      name,
      slug,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
      isActive: true,
    },
  });
  revalidateCats();
}

export async function updateProductCategory(input: { id: string; name?: string; isActive?: boolean }) {
  await requireAdmin();
  const current = await prisma.productCategory.findUnique({ where: { id: input.id } });
  if (!current) throw new Error("Kategori bulunamadı");
  const data: { name?: string; slug?: string; isActive?: boolean } = {};
  if (typeof input.name === "string" && input.name.trim()) {
    data.name = input.name.trim();
    if (data.name !== current.name) {
      const existing = await prisma.productCategory.findMany({
        where: { kind: current.kind, id: { not: current.id } },
        select: { slug: true },
      });
      data.slug = uniqueCategorySlug(current.kind, data.name, existing.map((row) => `${current.kind}:${row.slug}`));
    }
  }
  if (typeof input.isActive === "boolean") data.isActive = input.isActive;
  await prisma.productCategory.update({ where: { id: input.id }, data });
  revalidateCats();
}

export async function deleteProductCategory(id: string) {
  await requireAdmin();
  const row = await prisma.productCategory.findUnique({ where: { id }, include: { children: true } });
  if (!row) return;
  if (!row.parentId) throw new Error("Ana kategori silinemez");
  await prisma.productCategory.delete({ where: { id } });
  revalidateCats();
}

export async function reorderProductCategories(ids: string[]) {
  await requireAdmin();
  await prisma.$transaction(ids.map((id, sortOrder) => prisma.productCategory.update({ where: { id }, data: { sortOrder } })));
  revalidateCats();
}
