"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { AttachmentSpectrumVisual } from "@/components/AttachmentSpectrumVisual";
import { ScoreBreakdown } from "@/types/assessment";
import {
  Share2,
  Flame,
  AlertTriangle,
  Download,
  Heart,
  KeyRound,
  FileCheck2,
  Clock,
  Compass,
  BookOpen,
} from "lucide-react";

interface ReportViewProps {
  scoreData: ScoreBreakdown;
  resultId: string;
  isUnlocked: boolean;
}

export function PremiumReportView({
  scoreData,
  resultId,
  isUnlocked,
}: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe ignore
      }
    }
  }, [isUnlocked]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (err) {
      console.warn("Clipboard copy failed, fallback:", err);
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Safe ignore
    }
  };

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/quiz?ref=${resultId.slice(0, 8)}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
        return;
      }
    } catch {
      // Safe ignore
    }
  };

  const deep = scoreData.deepDive;
  const attraction = scoreData.partnerAttractionWarning;
  const conflict = scoreData.conflictShadow;
  const wound = scoreData.childhoodWound;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
      {/* Action / Toolbar Header (Hidden in Print) */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-700">
            Verified Premium Analysis • Portal ID: <code className="text-stone-500 font-mono">{resultId.slice(0, 14)}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share / Bookmark"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="space-y-8 bg-white p-6 sm:p-12 rounded-3xl border border-stone-200/90 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Cover Header */}
        <div className="border-b border-stone-100 pb-8 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-block text-xs uppercase tracking-widest font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Confidential Psychological Profile
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Generated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-2 mb-3">
            {scoreData.archetypeTitle}
          </h1>

          <p className="text-base sm:text-lg font-medium text-rose-800">
            Subconscious Shadow Archetype: &ldquo;{scoreData.shadowSubtype}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-2xl">
            {scoreData.shortSummary}
          </p>
        </div>

        {/* Section 1: Coordinate Spectrum Radar */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-rose-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              1. Your Attachment Coordinates
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed">
            Plotted against the ECR-R (Experiences in Close Relationships-Revised) psychometric matrix across 120,000+ benchmarked relationships.
          </p>

          <AttachmentSpectrumVisual
            anxiousPercent={scoreData.anxiousPercent}
            avoidantPercent={scoreData.avoidantPercent}
            archetype={scoreData.archetype}
          />
        </div>

        {/* Section 2: Fatal Attraction Partner Warning */}
        {attraction && (
          <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-3 text-rose-900">
              <Flame className="w-5 h-5 text-rose-700" />
              <h2 className="font-serif text-2xl font-bold">
                2. Your Subconscious Attraction Loop
              </h2>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200/80 mb-4 shadow-sm">
              <span className="text-xs uppercase tracking-wider font-bold text-rose-700">The Partner You Inevitably Magnetize:</span>
              <h3 className="text-lg font-bold text-stone-900 mt-1">{attraction.drawnToType}</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                {attraction.whyAttracted}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white/80 p-4 rounded-xl border border-rose-100">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">The Breaking Point:</span>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  {attraction.theBreakingPoint}
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">The Rewiring Antidote:</span>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  {attraction.antidote}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Conflict Shadow & Stress Response */}
        {conflict && (
          <div className="bg-amber-50/50 border border-amber-200/90 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-3 text-amber-950">
              <KeyRound className="w-5 h-5 text-amber-700" />
              <h2 className="font-serif text-2xl font-bold">
                3. Your Conflict Shadow Response
              </h2>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-2">{conflict.title}</h3>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700">
              <div className="bg-white p-4 rounded-2xl border border-amber-200/60">
                <strong className="text-amber-900 block mb-1">Primary Stress Trigger:</strong>
                <p>{conflict.trigger}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200/60">
                <strong className="text-amber-900 block mb-1">Default Involuntary Reaction:</strong>
                <p>{conflict.defaultReaction}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200/60">
                <strong className="text-emerald-900 block mb-1">Nervous System Calibration:</strong>
                <p>{conflict.nervousSystemReframe}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Childhood Wound Blueprint */}
        {wound && (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 mb-3 text-stone-900">
              <BookOpen className="w-5 h-5 text-stone-700" />
              <h2 className="font-serif text-2xl font-bold">
                4. The Childhood Blueprint &amp; Unconscious Contract
              </h2>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-2">{wound.title}</h3>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200">
                <span className="text-xs uppercase font-bold text-stone-500">The Subconscious Contract:</span>
                <p className="text-xs sm:text-sm text-stone-800 font-medium mt-1.5 leading-relaxed">
                  &ldquo;{wound.subconsciousContract}&rdquo;
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200">
                <span className="text-xs uppercase font-bold text-stone-500">The Deepest Subconscious Fear:</span>
                <p className="text-xs sm:text-sm text-stone-800 font-medium mt-1.5 leading-relaxed">
                  {wound.coreFear}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm">
              <strong className="block mb-1 font-semibold text-emerald-900">Your Daily Healing Mantra:</strong>
              <p className="italic">&ldquo;{wound.healingMantra}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Section 5: Toxic Deactivation Triggers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              5. Your Toxic Deactivation Triggers
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {deep.toxicTriggers.map((trigger, idx) => (
              <div
                key={idx}
                className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 flex flex-col justify-between"
              >
                <div>
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center mb-3">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                    {trigger}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Communication Scripts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              6. High-Stakes Communication Scripts
            </h2>
          </div>

          <div className="space-y-4">
            {deep.communicationFixes.map((fix, idx) => (
              <div
                key={idx}
                className="grid sm:grid-cols-2 gap-3 p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200"
              >
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-rose-800 block mb-1">
                    Automatic Toxic Reflex:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    &ldquo;{fix.impulse}&rdquo;
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 block mb-1">
                    Secure Re-calibration Script:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                    &ldquo;{fix.healthyReframe}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: 30-Day Rewiring Action Plan */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-rose-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              7. Customized 30-Day Subconscious Rewiring Action Plan
            </h2>
          </div>

          <div className="space-y-3">
            {deep.actionPlan30Days.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-rose-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {step.days} • {step.phase}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    Core Focus: {step.focus}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <strong>Daily Practice:</strong> {step.exercise}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Viral Loop & Partner Compatibility Invite (Hidden in Print) */}
        <div className="no-print pt-6 border-t border-stone-200">
          <div className="bg-gradient-to-r from-rose-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-800 text-rose-200 mb-3">
                <Heart className="w-3.5 h-3.5" /> Couple Diagnostic Referral
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Curious About Your Partner&apos;s Blindspots?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-lg leading-relaxed">
                Invite your partner or friend to take the assessment to compare your Attachment Spectrum &amp; Conflict Matrix side-by-side.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyInvite}
              className="shrink-0 px-5 py-3 rounded-xl bg-white text-stone-900 hover:bg-rose-50 font-bold text-xs sm:text-sm transition shadow-md active:scale-95"
            >
              {inviteCopied ? "Invite Link Copied!" : "Copy Couple Assessment Link"}
            </button>
          </div>
        </div>

        {/* Medical & Clinical Disclaimer */}
        <div className="pt-6 border-t border-stone-100 text-center text-xs text-stone-400 leading-relaxed">
          <p>
            Attachment Style &amp; Relationship Shadow Assessment &copy; {new Date().getFullYear()}. All rights reserved.
          </p>
          <p className="mt-1">
            Clinical Disclaimer: This assessment is an educational and self-reflection instrument derived from psychological attachment theory frameworks. It is not intended as medical, psychiatric, or psychological diagnosis or treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
