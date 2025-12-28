"use client";

import { Trophy, Star, ExternalLink } from "lucide-react";

interface Advocate {
  email: string;
  referralCount: number;
  engagementScore: number;
}

interface TopAdvocatesProps {
  advocates: Advocate[];
  totalReferrals: number;
}

export default function TopAdvocates({ advocates, totalReferrals }: TopAdvocatesProps) {
  if (advocates.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Super-Advocates</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No referrals yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Top referrers will appear here
          </p>
        </div>
      </div>
    );
  }

  // Calculate contribution percentage
  const getContribution = (count: number) =>
    totalReferrals > 0 ? ((count / totalReferrals) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Super-Advocates</h3>
        </div>
        <span className="text-xs text-gray-500">
          Top {advocates.length} referrers
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        These users drove most of your referrals. Consider rewarding them on launch day!
      </p>

      <div className="space-y-3">
        {advocates.slice(0, 10).map((advocate, index) => (
          <div
            key={advocate.email}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              index === 0
                ? "bg-amber-50 border border-amber-200"
                : index <= 2
                ? "bg-gray-50"
                : ""
            }`}
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0
                  ? "bg-amber-500 text-white"
                  : index === 1
                  ? "bg-gray-400 text-white"
                  : index === 2
                  ? "bg-amber-700 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>

            {/* Email */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {advocate.email}
              </p>
              <p className="text-xs text-gray-500">
                {getContribution(advocate.referralCount)}% of all referrals
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {advocate.referralCount}
              </p>
              <p className="text-xs text-gray-500">referrals</p>
            </div>

            {/* Star indicator for top performers */}
            {index < 3 && (
              <Star
                className={`w-4 h-4 ${
                  index === 0 ? "text-amber-500 fill-amber-500" : "text-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {advocates.length > 10 && (
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all {advocates.length} advocates
        </button>
      )}
    </div>
  );
}
