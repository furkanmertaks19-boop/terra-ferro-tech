"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess, requireContentAccess } from "@/lib/authz";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { plainText } from "@/lib/sanitize";

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  email: z.string().email().optional().or(z.literal("")),
  subject: z.string().max(120).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  productId: z.string().optional(),
  usedTractorId: z.string().optional(),
});

export type LeadFormState = {
  success: boolean;
  error?: string;
};

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  if (String(formData.get("company_website") ?? "").trim()) {
    return { success: true };
  }

  const ip = clientIp(await headers());
  if (!rateLimit(`lead:${ip}`, 6, 10 * 60 * 1000).ok) {
    return { success: false, error: "invalid" };
  }

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    productId: formData.get("productId") || undefined,
    usedTractorId: formData.get("usedTractorId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "invalid" };
  }

  const { name, phone, email, subject, message, productId, usedTractorId } = parsed.data;
  const composed = [subject?.trim() ? `Subjekti: ${plainText(subject, 120)}` : null, message ? plainText(message, 2000) : null]
    .filter(Boolean)
    .join("\n\n");

  let productFk: string | null = productId || null;
  let usedFk: string | null = usedTractorId || null;
  if (usedFk) {
    const exists = await prisma.usedTractor.findUnique({ where: { id: usedFk }, select: { id: true } });
    if (!exists) usedFk = null;
    productFk = null;
  } else if (productFk) {
    const exists = await prisma.product.findUnique({ where: { id: productFk }, select: { id: true } });
    if (!exists) productFk = null;
  }

  await prisma.lead.create({
    data: {
      name: plainText(name, 120),
      phone: plainText(phone, 30),
      email: email || null,
      message: composed || null,
      productId: productFk,
      usedTractorId: usedFk,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  return { success: true };
}

export async function updateLeadStatus(id: string, status: "NEW" | "CONTACTED" | "QUOTED" | "COMPLETED") {
  await requireContentAccess();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function markLeadReadAction(id: string) {
  await requireContentAccess();
  const { markLeadRead } = await import("@/lib/leads-notifications");
  await markLeadRead(id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function markAllLeadsReadAction() {
  await requireContentAccess();
  const { markAllLeadsRead } = await import("@/lib/leads-notifications");
  await markAllLeadsRead();
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(id: string) {
  await requireAdminAccess();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
