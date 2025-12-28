import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/waitlist/[slug]/verify
 * Verify email and activate waitlist spot
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token required" },
        { status: 400 }
      );
    }

    // Get waitlist
    const waitlist = await prisma.waitlist.findUnique({
      where: { slug },
    });

    if (!waitlist) {
      return NextResponse.json(
        { error: "Waitlist not found" },
        { status: 404 }
      );
    }

    // Find signup with this token
    const signup = await prisma.signup.findFirst({
      where: {
        waitlistId: waitlist.id,
        verifyToken: token,
      },
    });

    if (!signup) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    if (signup.verified) {
      return NextResponse.json({
        success: true,
        message: "Your email is already verified!",
        alreadyVerified: true,
        position: signup.position,
        referralCode: signup.referralCode,
      });
    }

    // Verify the signup
    await prisma.signup.update({
      where: { id: signup.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        verifyToken: null, // Clear token after use
      },
    });

    // Track verification event
    await prisma.analyticsEvent.create({
      data: {
        waitlistId: waitlist.id,
        type: "verify",
        signupId: signup.id,
        metadata: { position: signup.position },
      },
    });

    // If they were referred, track the referral event
    if (signup.referredBy) {
      await prisma.analyticsEvent.create({
        data: {
          waitlistId: waitlist.id,
          type: "referral",
          metadata: {
            referrerCode: signup.referredBy,
            newSignupId: signup.id,
          },
        },
      });

      // Check if referrer unlocked any rewards
      const referrer = await prisma.signup.findFirst({
        where: { waitlistId: waitlist.id, referralCode: signup.referredBy },
      });

      if (referrer) {
        const rewards = await prisma.reward.findMany({
          where: { waitlistId: waitlist.id },
          orderBy: { threshold: "asc" },
        });

        // Find newly unlocked reward
        const unlockedReward = rewards.find(
          (r) =>
            referrer.referralCount >= r.threshold &&
            referrer.referralCount - 1 < r.threshold
        );

        if (unlockedReward) {
          // Send reward email (don't await to avoid slowing response)
          // sendRewardEmail would be called here
          console.log(`Reward unlocked for ${referrer.email}: ${unlockedReward.title}`);
        }
      }
    }

    // Send welcome email with referral link
    try {
      await sendWelcomeEmail(
        signup.email,
        { name: waitlist.name, slug: waitlist.slug },
        signup.position,
        signup.referralCode
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Your email is verified! You're on the list.",
      position: signup.position,
      referralCode: signup.referralCode,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
