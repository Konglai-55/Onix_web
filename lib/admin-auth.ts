import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "onix-admin-session";

export function verifyAdminPassword(password: string | null) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || !password) return false;

  return safeEqual(password, expectedPassword);
}

export function createAdminSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("缺少 ADMIN_PASSWORD 环境变量。");

  return crypto.createHmac("sha256", password).update(ADMIN_SESSION_COOKIE).digest("hex");
}

export function verifyAdminRequest(request: Request) {
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  return verifyAdminSession(cookie ?? null);
}

export function verifyAdminSession(token: string | null) {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  return safeEqual(token, createAdminSessionToken());
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  return valueBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}
