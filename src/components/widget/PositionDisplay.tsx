"use client";

import { useState } from "react";
import { Trophy, Gift, Share2, Copy, Check, ArrowUp } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string;
  threshold: number;
}

interface PositionDisplayProps {
  waitlistName: string;
  waitlistSlug: string;
  position: number;
  totalSignups: number;
  referralCode: string;
  referralCount: number;
  unlockedRewards: Reward[];
  nextReward: {
    title: string;
    threshold: number;
    referralsNeeded: number;
  } | null;
}

export default function PositionDisplay({
  waitlistName,
  waitlistSlug,
  position,
  totalSignups,
  referralCode,
  referralCount,
  unlockedRewards,
  nextReward,
}: PositionDisplayProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/w/${waitlistSlug}?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOnTwitter = () => {
    const text = `I just joined the ${waitlistName} waitlist! Join me:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const percentAhead = totalSignups > 0
    ? Math.round(((totalSignups - position) / totalSignups) * 100)
    : 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Position Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
          <p className="text-blue-100 text-sm font-medium mb-2">Your position</p>
          <p className="text-5xl font-bold text-white mb-2">#{position}</p>
          <p className="text-blue-100 text-sm">
            of {totalSignups.toLocaleString()} people
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-center gap-2">
          <ArrowUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">
            You're ahead of <strong className="text-gray-900">{percentAhead}%</strong> of signups
          </span>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Referrals</h3>
            <p className="text-sm text-gray-500">Refer friends to move up!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{referralCount}</p>
            <p className="text-sm text-gray-500">Referrals</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{unlockedRewards.length}</p>
            <p className="text-sm text-gray-500">Rewards Unlocked</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Your referral link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareOnTwitter}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share on X
            </button>
          </div>
        </div>
      </div>

      {/* Next Reward */}
      {nextReward && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Next Reward</h3>
              <p className="text-sm text-gray-500">{nextReward.referralsNeeded} more referrals to unlock</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="font-medium text-purple-900">{nextReward.title}</p>
            <p className="text-sm text-purple-700 mt-1">
              At {nextReward.threshold} referrals
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (referralCount / nextReward.threshold) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {referralCount} / {nextReward.threshold}
            </p>
          </div>
        </div>
      )}

      {/* Unlocked Rewards */}
      {unlockedRewards.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Unlocked Rewards
          </h3>
          <div className="space-y-3">
            {unlockedRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-green-50 rounded-lg p-4 border border-green-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-600" />
                  <p className="font-medium text-green-900">{reward.title}</p>
                </div>
                <p className="text-sm text-green-700">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
