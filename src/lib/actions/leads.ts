"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess, requireContentAccess } from "@/lib/authz";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { plainText } from "@/lib/sanitize";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "invalid"),
  subject: z.string().trim().max(120),
    message: z.string().trim().max(2000),
    productId: z.string().trim().min(1).optional(),
    usedTractorId: z.string().trim().min(1).optional(),
    locale: z.enum(["sq", "en", "tr"]).optional(),
  });

export type LeadFormState = {
  success: boolean;
  error?: string;
};

function formString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function formOptionalId(value: FormDataEntryValue | null) {
  const text = formString(value).trim();
  return text || undefined;
}

export async function createLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  try {
    if (formString(formData.get("company_website")).trim()) {
      return { success: true };
    }

    const ip = clientIp(await headers());
    if (!rateLimit(`lead:${ip}`, 6, 10 * 60 * 1000).ok) {
      return { success: false, error: "invalid" };
    }

    const parsed = leadSchema.safeParse({
      name: formString(formData.get("name")),
      phone: formString(formData.get("phone")),
      email: formString(formData.get("email")),
      subject: formString(formData.get("subject")),
      message: formString(formData.get("message")),
      productId: formOptionalId(formData.get("productId")),
      usedTractorId: formOptionalId(formData.get("usedTractorId")),
      locale: formString(formData.get("locale")) || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: "invalid" };
    }

    const { name, phone, email, subject, message, productId, usedTractorId, locale } = parsed.data;
    const composed = [subject ? `Subjekti: ${plainText(subject, 120)}` : null, message ? plainText(message, 2000) : null]
      .filter(Boolean)
      .join("\n\n");

    let productFk: string | null = productId ?? null;
    let usedFk: string | null = usedTractorId ?? null;

    if (usedFk) {
      try {
        const exists = await prisma.usedTractor.findUnique({ where: { id: usedFk }, select: { id: true } });
        if (!exists) usedFk = null;
        else productFk = null;
      } catch (error) {
        console.error("[createLead] usedTractor lookup failed", error);
        usedFk = null;
      }
    } else if (productFk) {
      const exists = await prisma.product.findUnique({ where: { id: productFk }, select: { id: true } });
      if (!exists) productFk = null;
    }

    await prisma.lead.create({
      data: {
        name: plainText(name, 120),
        phone: plainText(phone, 40),
        email: email || null,
        message: composed || null,
        ...(productFk ? { productId: productFk } : {}),
        ...(usedFk ? { usedTractorId: usedFk } : {}),
        locale: locale ?? "sq",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error) {
    console.error("[createLead]", error);
    return { success: false, error: "invalid" };
  }
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
