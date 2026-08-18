import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

const ALLOWED_HOSTS = ["res.cloudinary.com", "api.cloudinary.com"];

function isTrustedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function safePdfFilename(productName: string): string {
  const base = slugify(productName) || "teknik-dokuman";
  return `${base}-teknik-dokuman.pdf`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      technicalPdfUrl: true,
      showTechnicalPdf: true,
      status: true,
    },
  });

  if (
    !product ||
    product.status === "DRAFT" ||
    !product.showTechnicalPdf ||
    !product.technicalPdfUrl?.trim()
  ) {
    return new NextResponse("Teknik doküman bulunamadı.", { status: 404 });
  }

  const pdfUrl = product.technicalPdfUrl.trim();

  if (!isTrustedUrl(pdfUrl)) {
    return new NextResponse("Geçersiz PDF kaynağı.", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(pdfUrl, {
      headers: { Accept: "application/pdf, application/octet-stream, */*" },
    });
  } catch {
    return new NextResponse("PDF indirilemedi.", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("PDF bulunamadı.", { status: 502 });
  }

  const filename = safePdfFilename(product.name);

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
