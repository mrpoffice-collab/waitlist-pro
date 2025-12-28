import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import SignupWidget from "@/components/widget/SignupWidget";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const waitlist = await prisma.waitlist.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!waitlist) {
    return { title: "Waitlist Not Found" };
  }

  return {
    title: `Join ${waitlist.name}`,
    description: waitlist.description || `Sign up for the ${waitlist.name} waitlist`,
  };
}

export default async function WaitlistPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const waitlist = await prisma.waitlist.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      settings: true,
      _count: {
        select: { signups: { where: { verified: true } } },
      },
    },
  });

  if (!waitlist) {
    notFound();
  }

  const settings = waitlist.settings as Record<string, unknown> || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <SignupWidget
        slug={waitlist.slug}
        name={waitlist.name}
        description={waitlist.description}
        settings={settings as { primaryColor?: string; buttonText?: string; successMessage?: string; showCount?: boolean }}
        totalSignups={waitlist._count.signups}
        referralCode={ref || null}
      />

      <p className="mt-8 text-sm text-gray-400">
        Powered by{" "}
        <a href="/" className="hover:text-gray-600 transition-colors">
          WaitlistPro
        </a>
      </p>
    </div>
  );
}
