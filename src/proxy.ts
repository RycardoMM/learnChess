import { NextRequest, NextResponse } from "next/server";

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidSession(token: string | undefined, secret: string) {
  if (!token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  return (await sign(value, secret)) === sig;
}

export async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.SESSION_SECRET ?? "";
  const token = req.cookies.get("session")?.value;

  if (!(await isValidSession(token, secret))) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
