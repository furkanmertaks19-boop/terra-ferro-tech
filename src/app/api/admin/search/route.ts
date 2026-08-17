import { NextRequest, NextResponse } from "next/server";
import { requireContentAccess } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireContentAccess();
  } catch {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { fullTitle: { contains: q, mode: "insensitive" } },
        { series: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, slug: true },
    take: 8,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ results });
}
