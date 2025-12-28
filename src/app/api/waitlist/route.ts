import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/waitlist
 * Get all waitlists for current user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const waitlists = await prisma.waitlist.findMany({
      where: { ownerId: user.id },
      include: {
        _count: {
          select: {
            signups: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get verified counts
    const waitlistsWithStats = await Promise.all(
      waitlists.map(async (waitlist) => {
        const verifiedCount = await prisma.signup.count({
          where: { waitlistId: waitlist.id, verified: true },
        });
        return {
          ...waitlist,
          totalSignups: waitlist._count.signups,
          verifiedSignups: verifiedCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      waitlists: waitlistsWithStats,
    });
  } catch (error) {
    console.error("Get waitlists error:", error);
    return NextResponse.json(
      { error: "Failed to get waitlists" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/waitlist
 * Create a new waitlist
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Generate slug from name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists and make unique
    const existingSlug = await prisma.waitlist.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const waitlist = await prisma.waitlist.create({
      data: {
        name,
        slug,
        description: description || null,
        ownerId: user.id,
        settings: {
          primaryColor: "#3B82F6",
          buttonText: "Join Waitlist",
          successMessage: "Check your email to verify your spot!",
          showCount: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      waitlist,
    });
  } catch (error) {
    console.error("Create waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to create waitlist" },
      { status: 500 }
    );
  }
}
