import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/db";
import { runFraudChecks } from "@/lib/fraud-detection";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/waitlist/[slug]/signup
 * Sign up for a waitlist
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { email, ref } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
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

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;

    // Run fraud checks
    const fraudResult = await runFraudChecks(waitlist.id, email, ip, ref || null);

    if (!fraudResult.isValid) {
      return NextResponse.json(
        { error: fraudResult.reason || "Unable to process signup" },
        { status: 400 }
      );
    }

    // Check if already signed up
    const existing = await prisma.signup.findFirst({
      where: { waitlistId: waitlist.id, email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.verified) {
        return NextResponse.json(
          { error: "This email is already on the waitlist" },
          { status: 400 }
        );
      }
      // Resend verification email
      try {
        await sendVerificationEmail(
          email,
          { name: waitlist.name, slug: waitlist.slug },
          existing.verifyToken!
        );
      } catch (emailError) {
        console.error("Failed to resend verification:", emailError);
      }
      return NextResponse.json({
        success: true,
        message: "Verification email resent. Please check your inbox.",
        requiresVerification: true,
      });
    }

    // Get current position (total verified + 1)
    const currentCount = await prisma.signup.count({
      where: { waitlistId: waitlist.id },
    });
    const position = currentCount + 1;

    // Generate unique codes
    const referralCode = nanoid(8);
    const verifyToken = nanoid(32);

    // Create signup
    const signup = await prisma.signup.create({
      data: {
        waitlistId: waitlist.id,
        email: email.toLowerCase(),
        position,
        referralCode,
        verifyToken,
        referredBy: ref || null,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || null,
        referrerUrl: request.headers.get("referer") || null,
        fraudFlags: fraudResult.flags,
      },
    });

    // If referred, increment referrer's count
    if (ref) {
      await prisma.signup.updateMany({
        where: { waitlistId: waitlist.id, referralCode: ref },
        data: { referralCount: { increment: 1 } },
      });
    }

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        waitlistId: waitlist.id,
        type: "signup",
        signupId: signup.id,
        metadata: { referredBy: ref || null, position },
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        email,
        { name: waitlist.name, slug: waitlist.slug },
        verifyToken
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the signup, just log
    }

    return NextResponse.json({
      success: true,
      message: "Please check your email to verify your spot!",
      requiresVerification: true,
      position,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to process signup" },
      { status: 500 }
    );
  }
}
