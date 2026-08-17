import { NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/authz";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { maxPdfBytes, maxPdfMb } from "@/lib/upload-limits";

export const runtime = "nodejs";

function isPdfFile(file: File, buffer: Buffer) {
  const nameOk = file.name.toLowerCase().endsWith(".pdf");
  const typeOk = file.type === "application/pdf" || file.type === "" || file.type === "application/octet-stream";
  const headerOk = buffer.subarray(0, 5).toString("utf8") === "%PDF-";
  return nameOk && typeOk && headerOk;
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

  const limit = maxPdfBytes();
  if (file.size > limit) {
    return NextResponse.json({ error: `PDF dosyası en fazla ${maxPdfMb(limit)} MB olabilir.` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdfFile(file, buffer)) {
    return NextResponse.json({ error: "Yalnızca PDF dosyaları yüklenebilir." }, { status: 400 });
  }

  try {
    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "terra-ferro/docs",
            resource_type: "raw",
            use_filename: false,
            unique_filename: true,
            format: "pdf",
          },
          (err, result) => {
            if (err || !result?.secure_url || !result.public_id) {
              reject(err ?? new Error("Cloudinary yanıt vermedi"));
              return;
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              bytes: result.bytes ?? file.size,
            });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      name: file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80),
      size: uploaded.bytes,
    });
  } catch {
    return NextResponse.json({ error: "Yükleme başarısız oldu" }, { status: 502 });
  }
}
