"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Settings,
  Download,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import ViralCoefficient from "@/components/dashboard/ViralCoefficient";
import StatsCards from "@/components/dashboard/StatsCards";
import TopAdvocates from "@/components/dashboard/TopAdvocates";
import SignupChart from "@/components/dashboard/SignupChart";

interface DashboardData {
  waitlist: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    settings: Record<string, unknown>;
    rewards: Array<{
      id: string;
      title: string;
      description: string;
      threshold: number;
    }>;
    createdAt: string;
  };
  metrics: {
    kFactor: number;
    kFactorTrend: "up" | "down" | "stable";
    totalSignups: number;
    verifiedSignups: number;
    totalReferrals: number;
    avgReferralsPerUser: number;
    topReferrers: Array<{
      email: string;
      referralCount: number;
      engagementScore: number;
    }>;
    organicSignups: number;
    referredSignups: number;
    organicPercentage: number;
    signupsLast24h: number;
    signupsLast7d: number;
    signupsLast30d: number;
    verificationRate: number;
    avgTimeToVerify: number | null;
  };
  advocates: Array<{
    email: string;
    referralCount: number;
    engagementScore: number;
    contributionPercentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    total: number;
    organic: number;
    referred: number;
  }>;
  fraudStats: {
    total: number;
    flagged: {
      disposableEmail: number;
      sameIpReferral: number;
      suspiciousPattern: number;
    };
    cleanRate: number;
  };
}

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/dashboard/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load dashboard");
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const copyWidgetUrl = async () => {
    if (!data) return;
    const url = `${window.location.origin}/w/${data.waitlist.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = async () => {
    const response = await fetch(`/api/dashboard/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", filter: "all" }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data?.waitlist.slug || "waitlist"}-signups.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load dashboard"}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { waitlist, metrics, advocates, dailyTrend, fraudStats } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{waitlist.name}</h1>
              <p className="text-sm text-gray-500">
                Created {new Date(waitlist.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={copyWidgetUrl}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Widget URL"}</span>
              </button>
              <a
                href={`/w/${waitlist.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Waitlist</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Stats Cards */}
        <StatsCards
          totalSignups={metrics.totalSignups}
          verifiedSignups={metrics.verifiedSignups}
          totalReferrals={metrics.totalReferrals}
          verificationRate={metrics.verificationRate}
          signupsLast24h={metrics.signupsLast24h}
          signupsLast7d={metrics.signupsLast7d}
          organicPercentage={metrics.organicPercentage}
        />

        {/* Viral Coefficient - THE KEY DIFFERENTIATOR */}
        <ViralCoefficient
          kFactor={metrics.kFactor}
          kFactorTrend={metrics.kFactorTrend}
          totalSignups={metrics.totalSignups}
          totalReferrals={metrics.totalReferrals}
          avgReferralsPerUser={metrics.avgReferralsPerUser}
        />

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Signup Trend */}
          <SignupChart data={dailyTrend} />

          {/* Top Advocates */}
          <TopAdvocates
            advocates={advocates}
            totalReferrals={metrics.totalReferrals}
          />
        </div>

        {/* Fraud Stats */}
        {fraudStats.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Signup Quality</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {fraudStats.cleanRate.toFixed(0)}%
                </p>
                <p className="text-sm text-green-600">Clean Rate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-700">
                  {fraudStats.flagged.disposableEmail}
                </p>
                <p className="text-sm text-gray-500">Disposable Emails</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-700">
                  {fraudStats.flagged.sameIpReferral}
                </p>
                <p className="text-sm text-gray-500">Self-Referrals</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-700">
                  {fraudStats.flagged.suspiciousPattern}
                </p>
                <p className="text-sm text-gray-500">Suspicious</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <a
            href={`/dashboard/${id}/launch`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Launch Day Tools
          </a>
          <a
            href={`/dashboard/${id}/settings`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </div>
      </main>
    </div>
  );
}
