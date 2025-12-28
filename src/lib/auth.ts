import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "./db";

const SESSION_COOKIE = "waitlistpro_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Create a session token (simple base64 encoded user ID + timestamp)
 */
function createSessionToken(userId: string): string {
  const data = JSON.stringify({
    userId,
    createdAt: Date.now(),
  });
  return Buffer.from(data).toString("base64");
}

/**
 * Parse a session token
 */
function parseSessionToken(token: string): { userId: string; createdAt: number } | null {
  try {
    const data = JSON.parse(Buffer.from(token, "base64").toString());
    return data;
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSession(userId: string): Promise<void> {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = parseSessionToken(token);
  if (!session) {
    return null;
  }

  // Check if session is expired
  const age = Date.now() - session.createdAt;
  if (age > SESSION_MAX_AGE * 1000) {
    return null;
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Require authentication - throws if not logged in
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
