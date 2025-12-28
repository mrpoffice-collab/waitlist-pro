"use client";

import { TrendingUp, TrendingDown, Minus, Sparkles, Info } from "lucide-react";

interface ViralCoefficientProps {
  kFactor: number;
  kFactorTrend: "up" | "down" | "stable";
  totalSignups: number;
  totalReferrals: number;
  avgReferralsPerUser: number;
}

export default function ViralCoefficient({
  kFactor,
  kFactorTrend,
  totalSignups,
  totalReferrals,
  avgReferralsPerUser,
}: ViralCoefficientProps) {
  // Determine color based on K-factor
  const getColor = () => {
    if (kFactor >= 1.5) return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", accent: "text-green-600" };
    if (kFactor >= 1.0) return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", accent: "text-emerald-600" };
    if (kFactor >= 0.5) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "text-amber-600" };
    return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", accent: "text-gray-600" };
  };

  const colors = getColor();

  // Get trend icon
  const TrendIcon = kFactorTrend === "up" ? TrendingUp : kFactorTrend === "down" ? TrendingDown : Minus;

  // Get message based on K-factor
  const getMessage = () => {
    if (kFactor >= 1.5) return "Exceptional viral growth! Each signup brings 1.5+ new signups.";
    if (kFactor >= 1.0) return "You're viral! Each signup generates at least one more.";
    if (kFactor >= 0.5) return "Good momentum. Close to viral growth.";
    if (kFactor >= 0.2) return "Building momentum. Encourage more sharing.";
    return "Early stage. Set up rewards to boost referrals.";
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${colors.accent}`} />
          <h3 className={`font-semibold ${colors.text}`}>Viral Coefficient (K-Factor)</h3>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <p className="font-medium mb-1">What is K-Factor?</p>
            <p className="text-gray-300">
              K = Total Referrals / Total Signups
            </p>
            <p className="text-gray-300 mt-2">
              K ≥ 1.0 means viral growth - each user brings at least one more user organically.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div>
          <span className={`text-5xl font-bold ${colors.text}`}>
            {kFactor.toFixed(2)}
          </span>
          <span className={`text-lg ${colors.text} ml-1`}>x</span>
        </div>
        <div className={`flex items-center gap-1 pb-2 ${
          kFactorTrend === "up" ? "text-green-600" :
          kFactorTrend === "down" ? "text-red-600" : "text-gray-500"
        }`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {kFactorTrend === "up" ? "Growing" : kFactorTrend === "down" ? "Declining" : "Stable"}
          </span>
        </div>
      </div>

      <p className={`text-sm ${colors.text} mb-6`}>{getMessage()}</p>

      {/* Visual indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>0</span>
          <span className="font-medium">Viral threshold (1.0)</span>
          <span>2.0+</span>
        </div>
        <div className="h-3 bg-white rounded-full relative overflow-hidden border border-gray-200">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-amber-200 to-green-300" />

          {/* Viral threshold marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-700" />

          {/* Current position */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow-sm transition-all duration-500"
            style={{
              left: `${Math.min(100, (kFactor / 2) * 100)}%`,
              marginLeft: "-8px",
            }}
          />
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalSignups}</p>
          <p className="text-xs text-gray-500">Total Signups</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
          <p className="text-xs text-gray-500">Total Referrals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{avgReferralsPerUser.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Avg per User</p>
        </div>
      </div>
    </div>
  );
}
