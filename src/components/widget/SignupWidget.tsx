"use client";

import { useState } from "react";
import { Mail, Users, Share2, Check, Loader2 } from "lucide-react";

interface WaitlistSettings {
  primaryColor?: string;
  buttonText?: string;
  successMessage?: string;
  showCount?: boolean;
}

interface SignupWidgetProps {
  slug: string;
  name: string;
  description?: string | null;
  settings?: WaitlistSettings;
  totalSignups?: number;
  referralCode?: string | null;
}

type WidgetState = "form" | "loading" | "success" | "error";

export default function SignupWidget({
  slug,
  name,
  description,
  settings = {},
  totalSignups = 0,
  referralCode,
}: SignupWidgetProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<WidgetState>("form");
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  const primaryColor = settings.primaryColor || "#3B82F6";
  const buttonText = settings.buttonText || "Join Waitlist";
  const successMessage = settings.successMessage || "Check your email to verify your spot!";
  const showCount = settings.showCount !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      setState("error");
      return;
    }

    setState("loading");

    try {
      const response = await fetch(`/api/waitlist/${slug}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ref: referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
        setState("error");
        return;
      }

      setMessage(data.message || successMessage);
      setPosition(data.position || null);
      setState("success");
    } catch (err) {
      setMessage("Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Check className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're almost in!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          {position && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Your position</p>
              <p className="text-3xl font-bold text-gray-900">#{position}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state === "error") setState("form");
              }}
              disabled={state === "loading"}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-500 disabled:opacity-50"
              style={{
                "--tw-ring-color": primaryColor
              } as React.CSSProperties}
            />
          </div>

          {state === "error" && message && (
            <p className="text-sm text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {state === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              buttonText
            )}
          </button>
        </form>

        {showCount && totalSignups > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>
              <strong className="text-gray-700">{totalSignups.toLocaleString()}</strong> people on the waitlist
            </span>
          </div>
        )}

        {referralCode && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Share2 className="w-4 h-4" />
            <span>Referred by a friend</span>
          </div>
        )}
      </div>
    </div>
  );
}
