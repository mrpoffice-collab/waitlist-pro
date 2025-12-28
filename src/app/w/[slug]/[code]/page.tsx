import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import PositionDisplay from "@/components/widget/PositionDisplay";

interface PageProps {
  params: Promise<{ slug: string; code: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!waitlist) {
    return { title: "Position Not Found" };
  }

  return {
    title: `Your Position - ${waitlist.name}`,
    description: `Check your position on the ${waitlist.name} waitlist`,
  };
}

export default async function PositionPage({ params }: PageProps) {
  const { slug, code } = await params;

  const waitlist = await prisma.waitlist.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!waitlist) {
    notFound();
  }

  // Find signup by referral code
  const signup = await prisma.signup.findFirst({
    where: {
      waitlistId: waitlist.id,
      referralCode: code,
    },
    select: {
      position: true,
      referralCode: true,
      referralCount: true,
      verified: true,
    },
  });

  if (!signup) {
    notFound();
  }

  // Get total verified signups
  const totalSignups = await prisma.signup.count({
    where: { waitlistId: waitlist.id, verified: true },
  });

  // Get unlocked rewards
  const unlockedRewards = await prisma.reward.findMany({
    where: {
      waitlistId: waitlist.id,
      threshold: { lte: signup.referralCount },
    },
    orderBy: { threshold: "asc" },
  });

  // Get next reward
  const nextReward = await prisma.reward.findFirst({
    where: {
      waitlistId: waitlist.id,
      threshold: { gt: signup.referralCount },
    },
    orderBy: { threshold: "asc" },
  });

  if (!signup.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Email Not Verified</h2>
          <p className="text-gray-600 mb-6">
            Please check your inbox and click the verification link to secure your spot.
          </p>
          <a
            href={`/w/${slug}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Waitlist
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          {waitlist.name}
        </h1>

        <PositionDisplay
          waitlistName={waitlist.name}
          waitlistSlug={waitlist.slug}
          position={signup.position}
          totalSignups={totalSignups}
          referralCode={signup.referralCode}
          referralCount={signup.referralCount}
          unlockedRewards={unlockedRewards}
          nextReward={
            nextReward
              ? {
                  title: nextReward.title,
                  threshold: nextReward.threshold,
                  referralsNeeded: nextReward.threshold - signup.referralCount,
                }
              : null
          }
        />

        <p className="mt-8 text-center text-sm text-gray-400">
          Powered by{" "}
          <a href="/" className="hover:text-gray-600 transition-colors">
            WaitlistPro
          </a>
        </p>
      </div>
    </div>
  );
}
