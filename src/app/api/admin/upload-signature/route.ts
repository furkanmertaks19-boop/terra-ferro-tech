import { NextResponse } from "next/server";
import { requireContentAccess, AuthError } from "@/lib/authz";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { z } from "zod";
import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  folder: z.enum(["products", "slides", "category-pages", "pages", "gallery", "docs"]).default("products"),
  resourceType: z.enum(["image", "video", "raw"]).default("image"),
});

const FOLDERS = {
  products: "terra-ferro/products",
  slides: "terra-ferro/slides",
  "category-pages": "terra-ferro/slides",
  pages: "terra-ferro/slides",
  gallery: "terra-ferro/gallery",
  docs: "terra-ferro/docs",
} as const;

export async function POST(req: Request) {
  try {
    await requireContentAccess();
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 401;
    return NextResponse.json({ error: "Yetkisiz" }, { status });
  }
  const ip = clientIp(await headers());
  if (!rateLimit(`upload-sign:${ip}`, 30).ok) {
    return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Yükleme yapılandırması eksik." }, { status: 500 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = FOLDERS[parsed.data.folder];
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    resourceType: parsed.data.resourceType,
  });
}
