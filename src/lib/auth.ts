import type { AstroCookies } from "astro";
import { createHmac, timingSafeEqual } from "node:crypto";

export type UserRole = "user" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

const COOKIE_NAME = "greenshop_session";

const toBase64Url = (value: string) =>
  Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf-8");
};

const getSessionSecret = () => {
  const secret = import.meta.env.AUTH_SESSION_SECRET as string | undefined;
  if (!secret) {
    return "dev-only-change-me";
  }
  return secret;
};

const sign = (payloadEncoded: string) =>
  createHmac("sha256", getSessionSecret()).update(payloadEncoded).digest("hex");

const constantTimeEqual = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

export const createSessionToken = (user: SessionUser) => {
  const payload = toBase64Url(JSON.stringify(user));
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

export const parseSessionToken = (token: string | undefined): SessionUser | null => {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as SessionUser;
    if (!parsed?.id || !parsed?.email || !parsed?.role) return null;
    if (parsed.role !== "user" && parsed.role !== "admin") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const getSessionUser = (cookies: AstroCookies): SessionUser | null =>
  parseSessionToken(cookies.get(COOKIE_NAME)?.value);

export const setSessionUser = (cookies: AstroCookies, user: SessionUser) => {
  cookies.set(COOKIE_NAME, createSessionToken(user), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearSessionUser = (cookies: AstroCookies) => {
  cookies.set(COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 0,
  });
};
