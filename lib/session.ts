import { randomBytes } from "crypto";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export const SESSION_COOKIE_NAME = "runly_session";
export const SESSION_MAX_AGE_SECONDS = ONE_DAY_SECONDS * 7;

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
