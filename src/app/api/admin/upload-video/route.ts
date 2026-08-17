import { NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/authz";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { MAX_VIDEO_BYTES, CLIENT_MAX_VIDEO_MB } from "@/lib/upload-limits";
import { videoPosterFromMedia } from "@/lib/cloudinary-media";

export const runtime = "nodejs";
export const maxDuration = 120;

const ALLOWED = new Set(["video/mp4", "video/webm"]);

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
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });

  const nameOk = /\.(mp4|webm)$/i.test(file.name);
  if (!ALLOWED.has(file.type) && !nameOk) {
    return NextResponse.json({ error: "Yalnızca MP4 veya WebM video yüklenebilir." }, { status: 400 });
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: `Video en fazla ${CLIENT_MAX_VIDEO_MB} MB olabilir.` }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "terra-ferro/gallery",
            resource_type: "video",
            use_filename: false,
            unique_filename: true,
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

    return NextResponse.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      posterUrl: videoPosterFromMedia(uploaded.secure_url),
    });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız oldu" }, { status: 502 });
  }
}
