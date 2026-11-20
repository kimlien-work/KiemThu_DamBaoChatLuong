import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { findStaffById } from "@/lib/admin-queries";
import type { Staff } from "@/types";

export const ADMIN_SESSION_COOKIE = "camera_admin_session";
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

const sessionRuntime = globalThis as typeof globalThis & { adminSessionSecret?: string };

export class SessionConfigurationError extends Error {
  constructor() {
    super("Admin session signing configuration is missing or invalid.");
    this.name = "SessionConfigurationError";
  }
}

export function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    sessionRuntime.adminSessionSecret ??= randomBytes(32).toString("hex");
    return sessionRuntime.adminSessionSecret;
  }
  if (!secret || secret.length < 32) {
    throw new SessionConfigurationError();
  }
  return secret;
}

export function createAdminSessionToken(staffId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ staffId, expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE * 1000 })
  ).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export async function getAdminSession(request: Request): Promise<Staff | null> {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!cookie) return null;

  const token = cookie.slice(ADMIN_SESSION_COOKIE.length + 1);
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  let session: { staffId?: unknown; expiresAt?: unknown };
  try {
    session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof session.staffId !== "number" ||
    !Number.isSafeInteger(session.staffId) ||
    session.staffId < 1 ||
    typeof session.expiresAt !== "number" ||
    !Number.isSafeInteger(session.expiresAt) ||
    session.expiresAt <= Date.now()
  ) {
    return null;
  }

  return findStaffById(session.staffId);
}
