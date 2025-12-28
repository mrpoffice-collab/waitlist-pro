import {
  Sparkles,
  Users,
  Shield,
  Zap,
  BarChart3,
  Trophy,
  Send,
  Check,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">WaitlistPro</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          The viral waitlist builder
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Know if your waitlist
          <br />
          <span className="text-blue-600">is growing itself</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          WaitlistPro shows you what other tools don't: your viral coefficient.
          See if each signup brings more signups, find your super-advocates,
          and block fake emails.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Create Your Waitlist
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#demo"
            className="px-8 py-4 text-gray-700 font-semibold text-lg hover:text-gray-900"
          >
            See Demo
          </a>
        </div>
      </section>

      {/* Viral Coefficient Highlight */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The metric that matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your viral coefficient (K-factor) tells you if your waitlist is
              growing organically. K &gt; 1 = viral growth.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Viral Coefficient</p>
                <p className="text-6xl font-bold text-green-600">
                  2.3<span className="text-2xl text-gray-400 ml-1">x</span>
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Viral Growth
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Each signup brings 2.3 more!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-gray-500">Total Signups</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">2,838</p>
                <p className="text-sm text-gray-500">Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-sm text-gray-500">Super-Advocates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need for launch
          </h2>
          <p className="text-lg text-gray-600">
            From signup to launch day, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Viral Coefficient Tracking
            </h3>
            <p className="text-gray-600">
              See your K-factor in real-time. Know instantly if your waitlist is
              growing organically.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Super-Advocate Identification
            </h3>
            <p className="text-gray-600">
              Find your top referrers who drive 80% of growth. Reward them on
              launch day.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fraud Detection
            </h3>
            <p className="text-gray-600">
              Block 500+ disposable email domains. Detect self-referrals and
              rate-limit abuse.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Referral Rewards
            </h3>
            <p className="text-gray-600">
              Set up tiered rewards for referrals. "Get 3 friends, unlock early
              access."
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Embeddable Widget
            </h3>
            <p className="text-gray-600">
              Add to any website in minutes. Mobile-friendly, customizable
              colors and copy.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Batch Invites
            </h3>
            <p className="text-gray-600">
              Launch day automation. Invite top 100 first, then batch the rest.
              Track conversions.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-gray-600">
              Pay only for verified signups. Not page views.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-500 mb-6">For testing</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">$0</p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  100 verified signups
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Basic analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  WaitlistPro branding
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-500 mb-6">For launches</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">
                $19<span className="text-lg font-normal text-gray-500">/mo</span>
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  2,500 verified signups
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Viral coefficient tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  No branding
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Fraud detection
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Batch invites
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Growth</h3>
              <p className="text-gray-500 mb-6">For scale</p>
              <p className="text-4xl font-bold text-gray-900 mb-6">
                $49<span className="text-lg font-normal text-gray-500">/mo</span>
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  10,000 verified signups
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Everything in Starter
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Webhooks
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Priority support
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to launch?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Create your viral waitlist in 2 minutes
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">WaitlistPro</span>
            </div>
            <p className="text-sm text-gray-500">
              Made for founders, by founders
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
