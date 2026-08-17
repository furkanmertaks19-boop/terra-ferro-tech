"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireContentAccess } from "@/lib/authz";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { plainText } from "@/lib/sanitize";

const leadSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  productId: z.string().optional(),
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
    message: formData.get("message"),
    productId: formData.get("productId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "invalid" };
  }

  const { name, phone, email, message, productId } = parsed.data;

  await prisma.lead.create({
    data: {
      name: plainText(name, 120),
      phone: plainText(phone, 30),
      email: email || null,
      message: message ? plainText(message, 2000) : null,
      productId: productId || null,
    },
  });

  return { success: true };
}

export async function updateLeadStatus(id: string, status: "NEW" | "CONTACTED" | "QUOTED" | "COMPLETED") {
  await requireContentAccess();
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
