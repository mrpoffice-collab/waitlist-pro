import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getViralMetrics, getSuperAdvocates, getDailyGrowthTrend } from "@/lib/viral-metrics";
import { getWaitlistFraudStats } from "@/lib/fraud-detection";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dashboard/[id]
 * Get comprehensive dashboard data for a waitlist
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    // Get waitlist
    const waitlist = await prisma.waitlist.findUnique({
      where: { id },
      include: {
        rewards: {
          orderBy: { threshold: "asc" },
        },
      },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    // Get all metrics in parallel
    const [viralMetrics, advocates, dailyTrend, fraudStats] = await Promise.all([
      getViralMetrics(id),
      getSuperAdvocates(id, 50),
      getDailyGrowthTrend(id, 30),
      getWaitlistFraudStats(id),
    ]);

    return NextResponse.json({
      success: true,
      waitlist: {
        id: waitlist.id,
        name: waitlist.name,
        slug: waitlist.slug,
        description: waitlist.description,
        settings: waitlist.settings,
        rewards: waitlist.rewards,
        createdAt: waitlist.createdAt,
      },
      metrics: viralMetrics,
      advocates,
      dailyTrend,
      fraudStats,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/[id]/export
 * Export signups as CSV
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { format = "csv", filter = "all" } = body;

    const waitlist = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    // Build query filter
    const where: Record<string, unknown> = { waitlistId: id };
    if (filter === "verified") {
      where.verified = true;
    } else if (filter === "unverified") {
      where.verified = false;
    } else if (filter === "advocates") {
      where.referralCount = { gt: 0 };
    }

    const signups = await prisma.signup.findMany({
      where,
      orderBy: { position: "asc" },
      select: {
        email: true,
        position: true,
        verified: true,
        referralCode: true,
        referralCount: true,
        referredBy: true,
        engagementScore: true,
        createdAt: true,
        verifiedAt: true,
        invited: true,
        invitedAt: true,
      },
    });

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Email",
        "Position",
        "Verified",
        "Referral Code",
        "Referrals",
        "Referred By",
        "Engagement Score",
        "Signed Up",
        "Verified At",
        "Invited",
        "Invited At",
      ];

      const rows = signups.map((s) => [
        s.email,
        s.position,
        s.verified ? "Yes" : "No",
        s.referralCode,
        s.referralCount,
        s.referredBy || "",
        s.engagementScore,
        s.createdAt.toISOString(),
        s.verifiedAt?.toISOString() || "",
        s.invited ? "Yes" : "No",
        s.invitedAt?.toISOString() || "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${waitlist.slug}-signups.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json({
      success: true,
      count: signups.length,
      signups,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
