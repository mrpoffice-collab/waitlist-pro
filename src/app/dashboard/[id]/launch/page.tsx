"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Send,
  Users,
  Trophy,
  Check,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface InviteStatus {
  totalVerified: number;
  alreadyInvited: number;
  remaining: number;
}

export default function LaunchPage() {
  const params = useParams();
  const id = params.id as string;

  const [status, setStatus] = useState<InviteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    invited: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [count, setCount] = useState(100);
  const [filter, setFilter] = useState<"top" | "advocates">("top");
  const [customMessage, setCustomMessage] = useState("");

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/dashboard/${id}/invite`);
      const data = await response.json();
      if (response.ok) {
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [id]);

  const sendInvites = async () => {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/dashboard/${id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count,
          filter,
          customMessage: customMessage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invites");
      }

      setResult({
        invited: data.invited,
        failed: data.failed,
      });

      // Refresh status
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invites");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/dashboard/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Launch Day Tools</h1>
          <p className="text-gray-500 mt-1">
            Send invites to your waitlist signups
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Status */}
        {status && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {status.totalVerified}
              </p>
              <p className="text-sm text-gray-500">Verified Signups</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {status.alreadyInvited}
              </p>
              <p className="text-sm text-gray-500">Already Invited</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Send className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {status.remaining}
              </p>
              <p className="text-sm text-gray-500">Remaining</p>
            </div>
          </div>
        )}

        {/* Invite Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Send Batch Invites
          </h2>

          <div className="space-y-6">
            {/* Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of invites to send
              </label>
              <input
                type="number"
                min="1"
                max={status?.remaining || 1000}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {status?.remaining || 0} remaining to invite
              </p>
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority order
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFilter("top")}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    filter === "top"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Users className={`w-5 h-5 mx-auto mb-2 ${filter === "top" ? "text-blue-600" : "text-gray-400"}`} />
                  <p className={`font-medium ${filter === "top" ? "text-blue-700" : "text-gray-700"}`}>
                    By Position
                  </p>
                  <p className="text-sm text-gray-500">
                    First in, first invited
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("advocates")}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    filter === "advocates"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Trophy className={`w-5 h-5 mx-auto mb-2 ${filter === "advocates" ? "text-purple-600" : "text-gray-400"}`} />
                  <p className={`font-medium ${filter === "advocates" ? "text-purple-700" : "text-gray-700"}`}>
                    By Referrals
                  </p>
                  <p className="text-sm text-gray-500">
                    Top referrers first
                  </p>
                </button>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom message (optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal note to your invite email..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <Check className="w-5 h-5" />
                <span>
                  Successfully invited {result.invited} users
                  {result.failed > 0 && ` (${result.failed} failed)`}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={sendInvites}
              disabled={sending || (status?.remaining || 0) === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Invites...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send {count} Invites
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 mb-2">Launch Day Tips</h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>• Start with your top advocates - they're most likely to engage</li>
            <li>• Send in batches of 100-500 to avoid overwhelming your systems</li>
            <li>• Monitor engagement between batches</li>
            <li>• Have your product ready before sending the first invite!</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
