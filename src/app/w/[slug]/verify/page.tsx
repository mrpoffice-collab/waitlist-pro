"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

type VerifyState = "loading" | "success" | "error";

interface VerifyResult {
  position?: number;
  referralCode?: string;
  alreadyVerified?: boolean;
  message?: string;
}

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [result, setResult] = useState<VerifyResult>({});
  const [error, setError] = useState("");

  const slug = params.slug as string;
  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setError("Missing verification token");
        setState("error");
        return;
      }

      try {
        const response = await fetch(`/api/waitlist/${slug}/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Verification failed");
          setState("error");
          return;
        }

        setResult(data);
        setState("success");
      } catch (err) {
        setError("Network error. Please try again.");
        setState("error");
      }
    };

    verify();
  }, [slug, token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href={`/w/${slug}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {result.alreadyVerified ? "Already Verified!" : "Email Verified!"}
        </h2>
        <p className="text-gray-600 mb-6">
          {result.message || "Your spot is confirmed!"}
        </p>

        {result.position && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Your position</p>
            <p className="text-4xl font-bold text-gray-900">#{result.position}</p>
          </div>
        )}

        {result.referralCode && (
          <a
            href={`/w/${slug}/${result.referralCode}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Your Position
          </a>
        )}
      </div>
    </div>
  );
}
