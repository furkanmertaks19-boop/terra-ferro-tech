"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/authz";
import {
  DEFAULT_MAP_EMBED_URL,
  extractMapEmbedUrl,
  toPhoneHref,
  toWhatsapp,
} from "@/lib/site-settings";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  location: z.string().min(2),
  mapEmbedUrl: z.string().min(8),
  website: z.string().optional(),
});

export type SettingsSaveResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  await requireAdminAccess();
}

export async function saveSiteSettings(input: z.infer<typeof settingsSchema>): Promise<SettingsSaveResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const mapEmbedUrl = extractMapEmbedUrl(parsed.data.mapEmbedUrl);
  if (!mapEmbedUrl) {
    return { ok: false, error: "Geçerli bir Google Maps embed URL girin" };
  }

  const phoneHref = toPhoneHref(parsed.data.phone);
  const website = (parsed.data.website ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "") || "www.terraferrotech.com";

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      companyName: parsed.data.companyName.trim(),
      email: parsed.data.email.trim(),
      phone: parsed.data.phone.trim(),
      phoneHref,
      location: parsed.data.location.trim(),
      mapEmbedUrl: mapEmbedUrl || DEFAULT_MAP_EMBED_URL,
      website,
      whatsapp: toWhatsapp(phoneHref),
      usedTractorsEnabled: false,
    },
    update: {
      companyName: parsed.data.companyName.trim(),
      email: parsed.data.email.trim(),
      phone: parsed.data.phone.trim(),
      phoneHref,
      location: parsed.data.location.trim(),
      mapEmbedUrl: mapEmbedUrl || DEFAULT_MAP_EMBED_URL,
      website,
      whatsapp: toWhatsapp(phoneHref),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/kontakt");
  revalidatePath("/rreth-nesh");
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function setUsedTractorsEnabled(enabled: boolean): Promise<SettingsSaveResult> {
  await requireAdmin();
  const current = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!current) {
    await prisma.siteSettings.create({
      data: {
        id: "default",
        companyName: "Terra Ferro Tech",
        email: "terraferrotech@gmail.com",
        phone: "+355 75 237 83 83",
        phoneHref: "+355752378383",
        location: "Lushnje, Albania",
        mapEmbedUrl: DEFAULT_MAP_EMBED_URL,
        website: "www.terraferrotech.com",
        whatsapp: "355752378383",
        usedTractorsEnabled: enabled,
      },
    });
  } else {
    await prisma.siteSettings.update({
      where: { id: "default" },
      data: { usedTractorsEnabled: enabled },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/traktore-te-perdorur");
  revalidatePath("/admin/used-tractors");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}
