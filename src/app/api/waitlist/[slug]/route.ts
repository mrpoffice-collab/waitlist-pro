import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getViralMetrics } from "@/lib/viral-metrics";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/waitlist/[slug]
 * Get public waitlist info (for displaying signup widget)
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;

    const waitlist = await prisma.waitlist.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        settings: true,
        _count: {
          select: { signups: true },
        },
      },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    // Get verified count
    const verifiedCount = await prisma.signup.count({
      where: { waitlistId: waitlist.id, verified: true },
    });

    return NextResponse.json({
      success: true,
      waitlist: {
        name: waitlist.name,
        slug: waitlist.slug,
        description: waitlist.description,
        settings: waitlist.settings,
        totalSignups: waitlist._count.signups,
        verifiedSignups: verifiedCount,
      },
    });
  } catch (error) {
    console.error("Get waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to get waitlist" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waitlist/[slug]/position/[code]
 * Check position by referral code
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code required" },
        { status: 400 }
      );
    }

    const waitlist = await prisma.waitlist.findUnique({
      where: { slug },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    const signup = await prisma.signup.findFirst({
      where: {
        waitlistId: waitlist.id,
        referralCode,
      },
      select: {
        email: true,
        position: true,
        referralCode: true,
        referralCount: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!signup) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    // Get total verified signups
    const totalVerified = await prisma.signup.count({
      where: { waitlistId: waitlist.id, verified: true },
    });

    // Get rewards they've unlocked
    const rewards = await prisma.reward.findMany({
      where: {
        waitlistId: waitlist.id,
        threshold: { lte: signup.referralCount },
      },
      orderBy: { threshold: "asc" },
    });

    // Get next reward milestone
    const nextReward = await prisma.reward.findFirst({
      where: {
        waitlistId: waitlist.id,
        threshold: { gt: signup.referralCount },
      },
      orderBy: { threshold: "asc" },
    });

    return NextResponse.json({
      success: true,
      position: signup.position,
      totalSignups: totalVerified,
      referralCount: signup.referralCount,
      referralCode: signup.referralCode,
      verified: signup.verified,
      unlockedRewards: rewards,
      nextReward: nextReward
        ? {
            title: nextReward.title,
            threshold: nextReward.threshold,
            referralsNeeded: nextReward.threshold - signup.referralCount,
          }
        : null,
    });
  } catch (error) {
    console.error("Position check error:", error);
    return NextResponse.json(
      { error: "Failed to check position" },
      { status: 500 }
    );
  }
}
