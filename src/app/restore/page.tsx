"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";
import {
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Receipt,
  HelpCircle,
} from "lucide-react";

export default function RestoreReportPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verification, setVerification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          verification: verification.trim(),
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setErrorMessage(
          data.error ||
            "Could not verify purchase details. Please double-check your email and receipt."
        );
        setIsLoading(false);
        return;
      }

      router.push(data.url);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-800 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
          Restore Your Report
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          Closed your browser tab or switched devices? Verify your purchase below to immediately reopen your unlocked 8-module report.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
        <form onSubmit={handleRestore} className="space-y-4">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="restore-email"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
            >
              Checkout Email Address
            </label>
            <input
              id="restore-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label
              htmlFor="restore-verification"
              className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
            >
              Card Last 4 Digits <span className="text-stone-400 font-normal">or</span> Stripe Receipt #
            </label>
            <input
              id="restore-verification"
              type="text"
              required
              minLength={4}
              maxLength={64}
              value={verification}
              onChange={(e) => setVerification(e.target.value)}
              placeholder="e.g. 4242 or 1492-3819"
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
            />
            <p className="mt-2 text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
              <span>
                Check the official receipt emailed by <strong>Stripe</strong> (shows your card&apos;s 4 digits, e.g. <code>•••• 4242</code>, or Receipt / Invoice number). Apple Pay &amp; Google Pay users: enter the 4 digits shown on your Stripe email receipt.
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Purchase...</span>
              </>
            ) : (
              <>
                <span>Unlock &amp; Reopen My Report</span>
                <ArrowRight className="w-4 h-4 text-rose-400" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 space-y-2.5 text-xs text-stone-500">
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Privacy-Protected Verification</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            To protect your psychological assessment privacy, reports are never unlocked by email address alone. Once reopened, click <strong>Share / Bookmark</strong> or <strong>Download PDF</strong> at the top of your report to save a local copy.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
          Need help locating your order? Email{" "}
          <a
            href={`mailto:${APP_CONFIG.supportEmail}`}
            className="underline font-medium text-stone-700 hover:text-stone-900"
          >
            {APP_CONFIG.supportEmail}
          </a>
        </span>
        <span className="hidden sm:inline text-stone-300">•</span>
        <Link href="/quiz" className="font-semibold text-rose-800 hover:underline">
          Take Free Assessment &rarr;
        </Link>
      </div>
    </div>
  );
}
