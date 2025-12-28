"use client";

import { Users, UserCheck, Share2, Mail, TrendingUp, Clock } from "lucide-react";

interface StatsCardsProps {
  totalSignups: number;
  verifiedSignups: number;
  totalReferrals: number;
  verificationRate: number;
  signupsLast24h: number;
  signupsLast7d: number;
  organicPercentage: number;
}

export default function StatsCards({
  totalSignups,
  verifiedSignups,
  totalReferrals,
  verificationRate,
  signupsLast24h,
  signupsLast7d,
  organicPercentage,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Signups",
      value: totalSignups.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Verified",
      value: verifiedSignups.toLocaleString(),
      subtext: `${verificationRate}% rate`,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Referrals",
      value: totalReferrals.toLocaleString(),
      subtext: `${(100 - organicPercentage).toFixed(0)}% referred`,
      icon: Share2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Last 24h",
      value: signupsLast24h.toLocaleString(),
      subtext: signupsLast7d > 0 ? `${signupsLast7d} this week` : undefined,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
          {stat.subtext && (
            <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}
