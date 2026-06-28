import { NextRequest, NextResponse } from "next/server";
import { getAdminRtdb } from "@/lib/firebase-admin";
import { isAuthenticated } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await req.json();
  await getAdminRtdb().ref(`lessons/${id}`).update(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await getAdminRtdb().ref(`lessons/${id}`).remove();
  return NextResponse.json({ ok: true });
}
