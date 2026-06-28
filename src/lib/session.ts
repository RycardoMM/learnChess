import crypto from "crypto";
import { NextRequest } from "next/server";

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function isAuthenticated(req: NextRequest): boolean {
  const secret = process.env.SESSION_SECRET;
  const token = req.cookies.get("session")?.value;
  if (!secret || !token) return false;
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  return sign(value, secret) === sig;
}
