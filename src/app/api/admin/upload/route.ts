import { NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/authz";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { MAX_IMAGE_BYTES, isAllowedImage } from "@/lib/upload-limits";

export const runtime = "nodejs";

function folderFor(value: FormDataEntryValue | null) {
  if (value === "slides" || value === "category-pages" || value === "pages") return "terra-ferro/slides";
  if (value === "gallery") return "terra-ferro/gallery";
  return "terra-ferro/products";
}

export async function POST(req: Request) {
  try {
    await requireContentAccess();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Yükleme yapılandırması eksik." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Görsel 10 MB'dan küçük olmalı." }, { status: 400 });
  }

  try {
    const folder = folderFor(form.get("folder"));
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isAllowedImage(file, buffer)) {
      return NextResponse.json({ error: "Yalnızca JPEG, PNG veya WEBP yüklenebilir." }, { status: 400 });
    }
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            use_filename: false,
            unique_filename: true,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
          },
          (err, result) => {
            if (err || !result?.secure_url || !result.public_id) {
              reject(err ?? new Error("Cloudinary yanıt vermedi"));
              return;
            }
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ url: uploaded.secure_url, publicId: uploaded.public_id });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız oldu" }, { status: 502 });
  }
}
