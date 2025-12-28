/**
 * Fraud Detection for Waitlist Signups
 *
 * Detects:
 * - Disposable email addresses
 * - Same-IP referrals (self-referral fraud)
 * - Rate limiting per IP
 * - Suspicious signup patterns
 */

import { DISPOSABLE_DOMAINS, SUSPICIOUS_PATTERNS } from "./disposable-domains";
import prisma from "./db";

export interface FraudCheckResult {
  isValid: boolean;
  flags: {
    disposableEmail: boolean;
    suspiciousPattern: boolean;
    sameIpReferral: boolean;
    ipRateLimit: boolean;
    rapidSignup: boolean;
  };
  score: number; // 0-100, higher = more suspicious
  reason?: string;
}

/**
 * Check if email is from a disposable provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true; // Invalid email format
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Check if email matches suspicious patterns
 */
export function hasSuspiciousPattern(email: string): boolean {
  const localPart = email.split("@")[0]?.toLowerCase();
  if (!localPart) return true;
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(email));
}

/**
 * Check if this signup is from the same IP as the referrer
 */
export async function isSameIpReferral(
  waitlistId: string,
  referralCode: string | null,
  ipAddress: string | null
): Promise<boolean> {
  if (!referralCode || !ipAddress) return false;

  const referrer = await prisma.signup.findFirst({
    where: {
      waitlistId,
      referralCode,
    },
    select: { ipAddress: true },
  });

  if (!referrer?.ipAddress) return false;
  return referrer.ipAddress === ipAddress;
}

/**
 * Check IP rate limit (max signups per IP per hour)
 */
export async function checkIpRateLimit(
  waitlistId: string,
  ipAddress: string | null,
  maxPerHour: number = 10
): Promise<boolean> {
  if (!ipAddress) return false;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentSignups = await prisma.signup.count({
    where: {
      waitlistId,
      ipAddress,
      createdAt: { gte: oneHourAgo },
    },
  });

  return recentSignups >= maxPerHour;
}

/**
 * Check for rapid signups (many in a short time from same IP)
 */
export async function checkRapidSignup(
  waitlistId: string,
  ipAddress: string | null,
  maxPerMinute: number = 3
): Promise<boolean> {
  if (!ipAddress) return false;

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const recentSignups = await prisma.signup.count({
    where: {
      waitlistId,
      ipAddress,
      createdAt: { gte: oneMinuteAgo },
    },
  });

  return recentSignups >= maxPerMinute;
}

/**
 * Run all fraud checks and return a comprehensive result
 */
export async function runFraudChecks(
  waitlistId: string,
  email: string,
  ipAddress: string | null,
  referralCode: string | null
): Promise<FraudCheckResult> {
  const flags = {
    disposableEmail: isDisposableEmail(email),
    suspiciousPattern: hasSuspiciousPattern(email),
    sameIpReferral: await isSameIpReferral(waitlistId, referralCode, ipAddress),
    ipRateLimit: await checkIpRateLimit(waitlistId, ipAddress),
    rapidSignup: await checkRapidSignup(waitlistId, ipAddress),
  };

  // Calculate fraud score (0-100)
  let score = 0;
  if (flags.disposableEmail) score += 40;
  if (flags.suspiciousPattern) score += 20;
  if (flags.sameIpReferral) score += 30;
  if (flags.ipRateLimit) score += 25;
  if (flags.rapidSignup) score += 15;

  // Determine if valid (score under threshold)
  const isValid = score < 40; // Allow some minor flags

  // Determine primary reason for blocking
  let reason: string | undefined;
  if (!isValid) {
    if (flags.disposableEmail) {
      reason = "Disposable email addresses are not allowed";
    } else if (flags.ipRateLimit) {
      reason = "Too many signups from this IP address";
    } else if (flags.sameIpReferral) {
      reason = "Self-referral detected";
    } else if (flags.rapidSignup) {
      reason = "Please wait before signing up again";
    } else if (flags.suspiciousPattern) {
      reason = "Please use a valid email address";
    }
  }

  return {
    isValid,
    flags,
    score,
    reason,
  };
}

/**
 * Get fraud statistics for a waitlist
 */
export async function getWaitlistFraudStats(waitlistId: string) {
  const signups = await prisma.signup.findMany({
    where: { waitlistId },
    select: { fraudFlags: true },
  });

  let disposableCount = 0;
  let sameIpCount = 0;
  let suspiciousCount = 0;

  for (const signup of signups) {
    const flags = signup.fraudFlags as Record<string, boolean> | null;
    if (flags?.disposableEmail) disposableCount++;
    if (flags?.sameIpReferral) sameIpCount++;
    if (flags?.suspiciousPattern) suspiciousCount++;
  }

  return {
    total: signups.length,
    flagged: {
      disposableEmail: disposableCount,
      sameIpReferral: sameIpCount,
      suspiciousPattern: suspiciousCount,
    },
    cleanRate: signups.length > 0
      ? ((signups.length - disposableCount - sameIpCount) / signups.length) * 100
      : 100,
  };
}
