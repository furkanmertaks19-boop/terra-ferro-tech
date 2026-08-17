import { NextRequest, NextResponse } from "next/server";
import { Category } from "@prisma/client";
import { searchProducts } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(`public-search:${clientIp(req.headers)}`, 40).ok) {
    return NextResponse.json({ results: [] }, { status: 429 });
  }
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const categoryParam = req.nextUrl.searchParams.get("category");
  const category =
    categoryParam === Category.TRACTOR || categoryParam === Category.EQUIPMENT
      ? categoryParam
      : undefined;
  const results = await searchProducts(q, 8, category);
  return NextResponse.json({ results });
}
