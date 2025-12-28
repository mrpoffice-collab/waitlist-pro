/**
 * Viral Metrics Calculation
 *
 * THE key differentiator of WaitlistPro - showing founders their K-factor
 *
 * K-factor (viral coefficient) = invites sent × conversion rate
 * For waitlists: K = total successful referrals / total verified signups
 *
 * K > 1 = viral growth (each signup brings more than 1 new signup)
 * K < 1 = growth requires paid acquisition
 */

import prisma from "./db";

export interface ViralMetrics {
  // Core viral coefficient
  kFactor: number;
  kFactorTrend: "up" | "down" | "stable";

  // Breakdown
  totalSignups: number;
  verifiedSignups: number;
  totalReferrals: number;
  avgReferralsPerUser: number;

  // Top performers (super-advocates)
  topReferrers: {
    email: string;
    referralCount: number;
    engagementScore: number;
  }[];

  // Growth metrics
  organicSignups: number; // No referral
  referredSignups: number; // Had a referrer
  organicPercentage: number;

  // Time-based
  signupsLast24h: number;
  signupsLast7d: number;
  signupsLast30d: number;

  // Quality
  verificationRate: number;
  avgTimeToVerify: number | null; // in minutes
}

/**
 * Calculate viral coefficient (K-factor)
 * K = total referrals / total signups
 * K > 1 means viral growth
 */
export async function calculateKFactor(waitlistId: string): Promise<number> {
  const [totalSignups, totalReferrals] = await Promise.all([
    prisma.signup.count({
      where: { waitlistId, verified: true },
    }),
    prisma.signup.aggregate({
      where: { waitlistId, verified: true },
      _sum: { referralCount: true },
    }),
  ]);

  if (totalSignups === 0) return 0;
  return (totalReferrals._sum.referralCount || 0) / totalSignups;
}

/**
 * Get comprehensive viral metrics for a waitlist
 */
export async function getViralMetrics(waitlistId: string): Promise<ViralMetrics> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [
    totalSignups,
    verifiedSignups,
    referralSum,
    organicCount,
    referredCount,
    signupsLast24h,
    signupsLast7d,
    signupsLast30d,
    topReferrers,
    verifiedWithTimes,
  ] = await Promise.all([
    // Total signups
    prisma.signup.count({ where: { waitlistId } }),

    // Verified signups
    prisma.signup.count({ where: { waitlistId, verified: true } }),

    // Total referrals
    prisma.signup.aggregate({
      where: { waitlistId },
      _sum: { referralCount: true },
    }),

    // Organic signups (no referrer)
    prisma.signup.count({
      where: { waitlistId, referredBy: null },
    }),

    // Referred signups
    prisma.signup.count({
      where: { waitlistId, referredBy: { not: null } },
    }),

    // Time-based counts
    prisma.signup.count({
      where: { waitlistId, createdAt: { gte: oneDayAgo } },
    }),
    prisma.signup.count({
      where: { waitlistId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.signup.count({
      where: { waitlistId, createdAt: { gte: thirtyDaysAgo } },
    }),

    // Top referrers (super-advocates)
    prisma.signup.findMany({
      where: { waitlistId, referralCount: { gt: 0 } },
      orderBy: { referralCount: "desc" },
      take: 10,
      select: {
        email: true,
        referralCount: true,
        engagementScore: true,
      },
    }),

    // For verification time calculation
    prisma.signup.findMany({
      where: { waitlistId, verified: true, verifiedAt: { not: null } },
      select: { createdAt: true, verifiedAt: true },
    }),
  ]);

  const totalReferrals = referralSum._sum.referralCount || 0;

  // Calculate K-factor
  const kFactor = verifiedSignups > 0 ? totalReferrals / verifiedSignups : 0;

  // Calculate average referrals per user
  const avgReferralsPerUser = totalSignups > 0 ? totalReferrals / totalSignups : 0;

  // Calculate organic percentage
  const organicPercentage = totalSignups > 0 ? (organicCount / totalSignups) * 100 : 0;

  // Calculate verification rate
  const verificationRate = totalSignups > 0 ? (verifiedSignups / totalSignups) * 100 : 0;

  // Calculate average time to verify
  let avgTimeToVerify: number | null = null;
  if (verifiedWithTimes.length > 0) {
    const totalMinutes = verifiedWithTimes.reduce((acc, signup) => {
      const created = signup.createdAt.getTime();
      const verified = signup.verifiedAt!.getTime();
      return acc + (verified - created) / (1000 * 60); // Convert to minutes
    }, 0);
    avgTimeToVerify = totalMinutes / verifiedWithTimes.length;
  }

  // Determine K-factor trend (would need historical data, simplified here)
  const kFactorTrend: "up" | "down" | "stable" = "stable";

  return {
    kFactor: Math.round(kFactor * 100) / 100,
    kFactorTrend,
    totalSignups,
    verifiedSignups,
    totalReferrals,
    avgReferralsPerUser: Math.round(avgReferralsPerUser * 100) / 100,
    topReferrers,
    organicSignups: organicCount,
    referredSignups: referredCount,
    organicPercentage: Math.round(organicPercentage * 10) / 10,
    signupsLast24h,
    signupsLast7d,
    signupsLast30d,
    verificationRate: Math.round(verificationRate * 10) / 10,
    avgTimeToVerify: avgTimeToVerify ? Math.round(avgTimeToVerify * 10) / 10 : null,
  };
}

/**
 * Get super-advocates (top referrers who drive most growth)
 */
export async function getSuperAdvocates(
  waitlistId: string,
  limit: number = 50
) {
  // Get all signups with referral data
  const signups = await prisma.signup.findMany({
    where: { waitlistId, referralCount: { gt: 0 } },
    orderBy: { referralCount: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      referralCount: true,
      engagementScore: true,
      emailOpens: true,
      linkClicks: true,
      createdAt: true,
      verified: true,
    },
  });

  // Calculate their contribution to total referrals
  const totalReferrals = signups.reduce((sum, s) => sum + s.referralCount, 0);

  return signups.map((signup) => ({
    ...signup,
    contributionPercentage: totalReferrals > 0
      ? Math.round((signup.referralCount / totalReferrals) * 1000) / 10
      : 0,
  }));
}

/**
 * Calculate daily growth trend
 */
export async function getDailyGrowthTrend(
  waitlistId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const signups = await prisma.signup.findMany({
    where: {
      waitlistId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      referredBy: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyData: Map<string, { total: number; organic: number; referred: number }> = new Map();

  for (const signup of signups) {
    const dateKey = signup.createdAt.toISOString().split("T")[0];
    const existing = dailyData.get(dateKey) || { total: 0, organic: 0, referred: 0 };
    existing.total++;
    if (signup.referredBy) {
      existing.referred++;
    } else {
      existing.organic++;
    }
    dailyData.set(dateKey, existing);
  }

  // Convert to array
  return Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}
