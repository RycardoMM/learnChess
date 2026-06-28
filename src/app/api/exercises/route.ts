import { NextRequest, NextResponse } from "next/server";
import { getAdminRtdb } from "@/lib/firebase-admin";
import { isAuthenticated } from "@/lib/session";

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const ref = await getAdminRtdb().ref("exercises").push(data);
  return NextResponse.json({ id: ref.key });
}
