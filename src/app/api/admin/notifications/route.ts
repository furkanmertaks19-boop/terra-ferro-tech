import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUnreadLeadCount, getUnreadLeadNotifications } from "@/lib/leads-notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [count, items] = await Promise.all([getUnreadLeadCount(), getUnreadLeadNotifications(8)]);
  return NextResponse.json({ count, items });
}
