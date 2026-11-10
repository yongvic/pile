import "server-only";

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scryptAsync = promisify(scrypt);
const cookieName = "pile_session";

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET manquant.");
  return value;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

export async function setSession(profileId: string): Promise<void> {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const body = Buffer.from(JSON.stringify({ sub: profileId, exp })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  const jar = await cookies();
  jar.set(cookieName, `${body}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(cookieName);
}

export async function readSession(): Promise<string | null> {
  if (!process.env.AUTH_SECRET) return null;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { sub?: string; exp?: number };
    if (!payload.sub || !payload.exp || payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function operatorEmails(): string[] {
  return (process.env.OPERATOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}
