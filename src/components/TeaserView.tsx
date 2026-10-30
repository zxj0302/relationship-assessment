"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreBreakdown } from "@/types/assessment";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  HeartHandshake,
  Loader2,
} from "lucide-react";

export function TeaserView() {
  const searchParams = useSearchParams();
  const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
  const [email, setEmail] = useState("");
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCanceledNotice, setShowCanceledNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setShowCanceledNotice(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fallbackArchetype = "Anxious-Preoccupied";
    const profile = ARCHETYPE_PROFILES[fallbackArchetype];
    const defaultScoreData: ScoreBreakdown = {
      anxiousRaw: 4.15,
      anxiousPercent: 79,
      avoidantRaw: 2.1,
      avoidantPercent: 28,
      archetype: fallbackArchetype,
      archetypeTitle: profile.archetypeTitle,
      shadowSubtype: profile.shadowSubtype,
      shortSummary: profile.shortSummary,
      deepDive: profile.deepDive,
    };

    try {
      // Retrieve stored assessment results
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("assessment_scores") ||
            localStorage.getItem("latest_assessment_scores")
          : null;

      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.archetypeTitle &&
          typeof parsed.anxiousPercent === "number" &&
          typeof parsed.avoidantPercent === "number"
        ) {
          setScoreData(parsed);
          return;
        } else {
          console.warn("Invalid assessment score object structure found in storage. Resetting.");
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("assessment_scores");
            localStorage.removeItem("latest_assessment_scores");
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse stored scores:", e);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("assessment_scores");
        localStorage.removeItem("latest_assessment_scores");
      }
    }

    // Fallback demo score if user lands directly on teaser or parsing failed
    setScoreData(defaultScoreData);
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreData) return;

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address to receive your report link.");
      return;
    }

    setErrorMessage("");
    setIsLoadingCheckout(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          anxiousRaw: scoreData.anxiousRaw,
          avoidantRaw: scoreData.avoidantRaw,
          anxiousPercent: scoreData.anxiousPercent,
          avoidantPercent: scoreData.avoidantPercent,
          archetype: scoreData.archetype,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "No checkout session URL was returned by the payment service.");
      }
    } catch (err: unknown) {
      console.error("Checkout initiation failure:", err);
      setErrorMessage(err instanceof Error ? err.message : "Error initiating checkout");
      setIsLoadingCheckout(false);
    }
  };

  if (!scoreData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Stripe Payment Canceled Banner Notice */}
      {showCanceledNotice && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start justify-between text-amber-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Checkout Incomplete — No Payment Was Processed</p>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Your payment was canceled and your card was not charged. Whenever you are ready, you can unlock your complete 12-page assessment below.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCanceledNotice(false)}
            className="text-amber-700 hover:text-amber-950 text-xs font-semibold px-2 py-1 rounded"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-8 flex items-center justify-between text-xs sm:text-sm text-amber-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Assessment Completed. Your primary archetype has been identified.</span>
        </div>
        <span className="font-semibold text-amber-800 hidden sm:inline">100% Verified</span>
      </div>

      {/* Free Teaser Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm mb-8 text-center">
        <span className="inline-block text-xs uppercase tracking-widest font-bold text-rose-800 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 mb-4">
          Your Primary Relational Archetype
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3">
          {scoreData.archetypeTitle}
        </h1>

        <p className="text-sm sm:text-base font-semibold text-rose-900/80 mb-6 italic">
          Shadow Subtype: {scoreData.shadowSubtype}
        </p>

        {/* Barnum Empathetic Diagnosis */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 text-left mb-6">
          <div className="flex items-center gap-2 font-semibold text-xs text-stone-700 uppercase tracking-wider mb-2">
            <HeartHandshake className="w-4 h-4 text-rose-700" />
            <span>Core Emotional Blueprint</span>
          </div>
          <p className="text-stone-800 text-sm sm:text-base leading-relaxed">
            {scoreData.shortSummary}
          </p>
        </div>

        {/* Dimension Metrics */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Attachment Anxiety
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{scoreData.anxiousPercent}%</span>
              <span className="text-xs text-stone-500 font-medium">
                ({scoreData.anxiousPercent >= 50 ? "Elevated" : "Grounded"})
              </span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-rose-700 h-full rounded-full"
                style={{ width: `${scoreData.anxiousPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Attachment Avoidance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900">{scoreData.avoidantPercent}%</span>
              <span className="text-xs text-stone-500 font-medium">
                ({scoreData.avoidantPercent >= 50 ? "Elevated" : "Receptive"})
              </span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-stone-800 h-full rounded-full"
                style={{ width: `${scoreData.avoidantPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The Blurred Teaser & Paywall Section */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 bg-white p-6 sm:p-10 shadow-lg">
        {/* Background Blurred Content (Simulating 12-page deep report) */}
        <div className="filter blur-md select-none pointer-events-none opacity-40 space-y-8">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              1. Your Deepest Subconscious Fear & Somatic Alarm
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed">
              Whenever emotional distance expands, your amygdala triggers an ancient panic response conditioned during early childhood. This leads to immediate physiological reactions including hyperventilation, obsessive cognitive loops, and impulsive reassurance-seeking behaviors that paradoxically push partners further away.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              2. The Exact Partner Archetype You Magnetize (And Why It Self-Destructs)
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed">
              You are unconsciously addicted to the intermittent validation offered by partners who alternate between warmth and cold withdrawal. This mirrors the unfinished emotional business with your primary attachment figure, keeping you trapped in the &ldquo;Anxious-Avoidant Trap&rdquo;.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              3. The 3 Toxic Deactivation Triggers
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed">
              When these specific 3 words or non-verbal gestures occur, your system switches into survival mode: 1) The Delayed Response, 2) The Unexplained Boundary, 3) The Flat Tone.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              4. Your 30-Day Subconscious Rewiring Action Plan
            </h3>
            <p className="text-stone-700 text-sm leading-relaxed">
              Phase 1: Somatic Down-Regulation (Days 1-7). Halting protest behaviors using physiological sigh breathing and 20-minute communication pauses...
            </p>
          </div>
        </div>

        {/* Paywall Overlay Hook */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/80 to-stone-950/40 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-12 h-12 rounded-full bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-rose-300 mb-1">
            Premium Clinical Diagnostic
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3 max-w-lg">
            Unlock Your Complete 12-Page Deep Analysis & Recovery Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
            Gain immediate lifetime access to your full childhood imprint analysis, toxic trigger breakdown, compatibility matrix, and the custom 30-Day Rewiring Action Plan.
          </p>

          {/* Pricing Box */}
          <div className="inline-flex items-baseline gap-2.5 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 mb-6">
            <span className="text-2xl font-extrabold text-white">$14.99</span>
            <span className="text-sm text-stone-400 line-through">$39.00</span>
            <span className="text-xs font-semibold bg-rose-600 text-white px-2 py-0.5 rounded-full">
              62% OFF
            </span>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleCheckout} className="w-full max-w-md space-y-3">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email to receive report"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white text-stone-900 placeholder-stone-400 text-sm px-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingCheckout}
              className="w-full flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-600 active:scale-[0.99] text-white font-bold text-base py-4 rounded-xl shadow-lg transition-all disabled:opacity-70"
            >
              {isLoadingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Preparing Secure Stripe Checkout...</span>
                </>
              ) : (
                <>
                  <span>Unlock Full Report ($14.99)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Guarantee & Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-stone-300 text-xs mt-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>14-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-rose-400" />
              <span>Instant Digital Access + Email Copy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Bullet List */}
      <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200">
        <h3 className="font-serif text-lg font-bold text-stone-900 mb-4">
          What is included in your $14.99 unlocked report:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Childhood Origin Blueprint:</strong> The subconscious roots of your relationship fear.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Attraction Magnetism Analysis:</strong> Why you attract emotionally unavailable partners.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>The 3 Toxic Deactivation Triggers:</strong> How to stop self-sabotaging conflict.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Word-for-Word Communication Scripts:</strong> What to say instead of protest behaviors.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Partner Compatibility Matrix:</strong> How you pair with Secure, Anxious, and Avoidant styles.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Custom 30-Day Rewiring Roadmap:</strong> Daily somatic and psychological exercises.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
