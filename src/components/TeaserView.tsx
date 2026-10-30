"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreBreakdown, AttachmentArchetype, RelationshipStatus } from "@/types/assessment";
import { calculateAssessmentScores } from "@/lib/scoring";
import { APP_CONFIG } from "@/lib/constants";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  Flame,
  KeyRound,
  FileText,
} from "lucide-react";

const VALID_ARCHETYPES: AttachmentArchetype[] = [
  "Secure",
  "Anxious-Preoccupied",
  "Dismissive-Avoidant",
  "Fearful-Avoidant",
];

export function TeaserView() {
  const searchParams = useSearchParams();
  const [scoreData, setScoreData] = useState<ScoreBreakdown | null>(null);
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [relationshipStatus, setRelationshipStatus] = useState<string>("single");
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCanceledNotice, setShowCanceledNotice] = useState(false);

  // 15-minute countdown timer state for CRO loss aversion
  const [timeLeft, setTimeLeft] = useState(899); // 14 mins 59 secs

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setShowCanceledNotice(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let initialScoreData: ScoreBreakdown | null = null;
    let foundAnswers: Record<number, number> | null = null;
    let foundStatus: string | null = null;

    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("assessment_scores") ||
            localStorage.getItem("latest_assessment_scores")
          : null;

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          if (parsed.answers && typeof parsed.answers === "object" && !Array.isArray(parsed.answers)) {
            foundAnswers = parsed.answers;
          }
          if (typeof parsed.relationshipStatus === "string") {
            foundStatus = parsed.relationshipStatus;
          }
          if (
            parsed.archetypeTitle &&
            typeof parsed.archetype === "string" &&
            VALID_ARCHETYPES.includes(parsed.archetype as AttachmentArchetype) &&
            typeof parsed.anxiousRaw === "number" &&
            Number.isFinite(parsed.anxiousRaw) &&
            parsed.anxiousRaw >= 1 &&
            parsed.anxiousRaw <= 5 &&
            typeof parsed.avoidantRaw === "number" &&
            Number.isFinite(parsed.avoidantRaw) &&
            parsed.avoidantRaw >= 1 &&
            parsed.avoidantRaw <= 5 &&
            typeof parsed.anxiousPercent === "number" &&
            Number.isFinite(parsed.anxiousPercent) &&
            parsed.anxiousPercent >= 0 &&
            parsed.anxiousPercent <= 100 &&
            typeof parsed.avoidantPercent === "number" &&
            Number.isFinite(parsed.avoidantPercent) &&
            parsed.avoidantPercent >= 0 &&
            parsed.avoidantPercent <= 100
          ) {
            initialScoreData = parsed;
            setScoreData(parsed);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse stored scores:", e);
    }

    try {
      if (typeof window !== "undefined") {
        const rawAnswers =
          sessionStorage.getItem("assessment_answers") ||
          localStorage.getItem("latest_assessment_answers");
        if (rawAnswers) {
          const parsedAns = JSON.parse(rawAnswers);
          if (parsedAns && typeof parsedAns === "object" && !Array.isArray(parsedAns)) {
            foundAnswers = parsedAns;
          }
        }
        const rawStatus =
          sessionStorage.getItem("assessment_relationship_status") ||
          localStorage.getItem("latest_relationship_status");
        if (rawStatus) {
          foundStatus = rawStatus;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored answers:", e);
    }

    if (foundAnswers) setAnswers(foundAnswers);
    if (foundStatus) setRelationshipStatus(foundStatus);

    if (!initialScoreData) {
      // Recompute from stored answers if available, otherwise fallback demo score
      const statusArg = (foundStatus as RelationshipStatus) || "single";
      const recomputed = calculateAssessmentScores(foundAnswers || {}, statusArg);
      setScoreData(recomputed);
    }
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
      const finalAnswers =
        Object.keys(answers).length > 0
          ? answers
          : scoreData.answers || {};

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
          relationshipStatus: relationshipStatus || scoreData.relationshipStatus || "single",
          answers: finalAnswers,
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
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Stripe Payment Canceled Banner Notice */}
      {showCanceledNotice && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start justify-between text-amber-900 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Checkout Incomplete — No Payment Was Charged</p>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Your payment was canceled. Your custom psychological blueprint is preserved below.
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

      {/* CRO Urgency & Social Proof Bar */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-stone-200">
            <strong>120,000+</strong> assessments taken • <strong>28 people</strong> unlocked today
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Discount reserved for: <strong className="font-mono text-white text-sm">{formatTimer(timeLeft)}</strong></span>
        </div>
      </div>

      {/* Free Teaser Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <span className="inline-block text-xs uppercase tracking-widest font-bold text-rose-800 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 mb-4">
          Your Core Attachment Style Identified
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3">
          {scoreData.archetypeTitle}
        </h1>

        <p className="text-sm sm:text-base font-semibold text-rose-800 mb-4 tracking-wide">
          Subconscious Archetype: &ldquo;{scoreData.shadowSubtype}&rdquo;
        </p>

        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
          {scoreData.shortSummary}
        </p>

        {/* Dimension Radar Cards */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-6 border-t border-stone-100">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Anxiety Index</p>
            <p className="text-2xl sm:text-3xl font-bold text-rose-800 mt-1">{scoreData.anxiousPercent}%</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {scoreData.anxiousPercent > 50 ? "High sensitivity to separation" : "Stable emotional baseline"}
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
            <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Avoidance Index</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-800 mt-1">{scoreData.avoidantPercent}%</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {scoreData.avoidantPercent > 50 ? "High defense against engulfment" : "Open to deep vulnerability"}
            </p>
          </div>
        </div>
      </div>

      {/* Blurred Paywall Cards: The Hidden Shadow Blueprint */}
      <div className="space-y-4 mb-8">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            What&apos;s Inside Your Unlocked 12-Page Analysis
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            4 critical sections currently locked behind your private report portal
          </p>
        </div>

        {/* Teaser 1: Fatal Attraction Loop */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-stone-900 text-base">
                {scoreData.archetype === "Secure"
                  ? `Your Natural Attraction Matrix: ${scoreData.partnerAttractionWarning?.drawnToType || "Emotionally Available Partners"}`
                  : `Your Toxic Attraction Magnet: ${scoreData.partnerAttractionWarning?.drawnToType || "The Avoidant Ghost"}`}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full border border-rose-200">
              Locked
            </span>
          </div>

          {scoreData.archetype === "Secure" ? (
            <div className="filter blur-sm select-none opacity-40 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-2">
              <p>
                You naturally gravitate toward mutual vulnerability, emotional presence, and stability. However, even secure nervous systems experience blind spots when encountering avoidant or anxious dysregulation...
              </p>
              <p>
                Discover how your secure foundation can withstand complex attachment dynamics and elevate your relationship fulfillment.
              </p>
            </div>
          ) : (
            <div className="filter blur-sm select-none opacity-40 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-2">
              <p>
                Your subconscious mind confuses the emotional unavailability and unpredictability of this partner type with authentic chemistry. Whenever they pull back, your somatic nervous system triggers protest behaviors...
              </p>
              <p>
                The 3 unconscious reasons you attract this specific partner loop and how to permanently short-circuit the chase.
              </p>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px]">
            <a href="#checkout-section" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-md hover:bg-stone-800 transition">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Unlock Partner Attraction Blueprint
            </a>
          </div>
        </div>

        {/* Teaser 2: Conflict Shadow Response */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <KeyRound className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-stone-900 text-base">
                Your Stress &amp; Conflict Shadow ({scoreData.conflictShadow?.title || "Nervous System Armor"})
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
              Locked
            </span>
          </div>

          <div className="filter blur-sm select-none opacity-40 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-2">
            <p>
              During high-intensity disagreements, your autonomic nervous system collapses into an automatic defense mechanism that sabotages communication before resolution can take place...
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px]">
            <a href="#checkout-section" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-md hover:bg-stone-800 transition">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Unlock Conflict Shadow Breakdown
            </a>
          </div>
        </div>

        {/* Teaser 3: 30-Day Rewiring Action Plan */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-stone-900 text-base">
                Your Custom 30-Day Subconscious Rewiring Action Plan
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
              Locked
            </span>
          </div>

          <div className="filter blur-sm select-none opacity-40 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-2">
            <p>
              Week 1: Emotional trigger de-escalation &amp; somatic breathwork scripts.<br />
              Week 2: Boundary re-negotiation &amp; breaking the protest-behavior cycle.<br />
              Week 3: Communication verbatim scripts for secure vulnerability.
            </p>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px]">
            <a href="#checkout-section" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold shadow-md hover:bg-stone-800 transition">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              Unlock 30-Day Action Plan
            </a>
          </div>
        </div>
      </div>

      {/* Main Checkout Paywall Card */}
      <div id="checkout-section" className="bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600/30 text-rose-300 border border-rose-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Limited Promotional Offer • Save 62%
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Unlock Your Complete 12-Page Deep Analysis
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg mx-auto">
            Get instant, permanent access to your full psychological roadmap, childhood wound diagnosis, and printable PDF guide.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-stone-400 line-through text-lg font-medium">$39.00</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white">$14.99</span>
            <span className="text-xs bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-semibold">
              One-Time Payment
            </span>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="grid sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-8 text-xs sm:text-sm text-stone-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full 12-Page Attachment &amp; Shadow Breakdown</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exact Partner Attraction Warning &amp; Loop Fix</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>30-Day Step-by-Step Somatic Rewiring Plan</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant PDF Export &amp; Permanent Web Portal</span>
          </div>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleCheckout} className="max-w-md mx-auto">
          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-stone-300 mb-1.5 text-left">
                Where should we send your private report &amp; portal link?
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingCheckout}
              className="w-full py-4 rounded-xl font-bold text-base bg-rose-700 hover:bg-rose-600 active:scale-[0.99] text-white transition shadow-lg shadow-rose-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingCheckout ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Stripe Secure Checkout...</span>
                </>
              ) : (
                <>
                  <span>Instant Access with Stripe ($14.99)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Trust Badges & Guarantee */}
        <div className="mt-8 pt-6 border-t border-stone-800 text-center max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-stone-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>14-Day 100% Hassle-Free Money-Back Guarantee</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            If this assessment does not provide profound clarity into your relationship patterns, email {APP_CONFIG.supportEmail} within 14 days for an immediate 100% refund. No questions asked.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
            <span>🔒 256-Bit SSL Encrypted</span>
            <span>•</span>
            <span>Powered by Stripe</span>
            <span>•</span>
            <span>Instant Email Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
