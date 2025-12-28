import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/dashboard/[id]/invite
 * Batch invite users on launch day
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      count = 100,           // How many to invite
      filter = "top",        // "top" (by position) or "advocates" (by referral count)
      customMessage,         // Optional custom message
      skipAlreadyInvited = true,
    } = body;

    const waitlist = await prisma.waitlist.findUnique({
      where: { id },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    // Build query
    const where: Record<string, unknown> = {
      waitlistId: id,
      verified: true,
    };

    if (skipAlreadyInvited) {
      where.invited = false;
    }

    // Get signups to invite
    const signups = await prisma.signup.findMany({
      where,
      orderBy:
        filter === "advocates"
          ? { referralCount: "desc" }
          : { position: "asc" },
      take: count,
      select: {
        id: true,
        email: true,
        position: true,
        referralCount: true,
      },
    });

    if (signups.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No signups to invite",
        invited: 0,
      });
    }

    // Send invite emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const signup of signups) {
      try {
        await sendInviteEmail(
          signup.email,
          { name: waitlist.name, slug: waitlist.slug },
          customMessage
        );

        // Mark as invited
        await prisma.signup.update({
          where: { id: signup.id },
          data: {
            invited: true,
            invitedAt: new Date(),
          },
        });

        // Track event
        await prisma.analyticsEvent.create({
          data: {
            waitlistId: id,
            type: "invite",
            signupId: signup.id,
            metadata: { batch: true },
          },
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to invite ${signup.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      invited: results.sent,
      failed: results.failed,
      total: signups.length,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error("Batch invite error:", error);
    return NextResponse.json(
      { error: "Failed to send invites" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboard/[id]/invite
 * Get invite status
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    const [totalVerified, alreadyInvited] = await Promise.all([
      prisma.signup.count({
        where: { waitlistId: id, verified: true },
      }),
      prisma.signup.count({
        where: { waitlistId: id, invited: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      totalVerified,
      alreadyInvited,
      remaining: totalVerified - alreadyInvited,
    });
  } catch (error) {
    console.error("Invite status error:", error);
    return NextResponse.json(
      { error: "Failed to get invite status" },
      { status: 500 }
    );
  }
}
