"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { AttachmentSpectrumVisual } from "@/components/AttachmentSpectrumVisual";
import { ScoreBreakdown } from "@/types/assessment";
import {
  Printer,
  Share2,
  Flame,
  AlertTriangle,
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

  useEffect(() => {
    if (isUnlocked) {
      // Fire subtle celebratory confetti upon unlock
      try {
        confetti({
          particleCount: 50,
          spread: 60,
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
      console.warn("navigator.clipboard.writeText failed, using fallback:", err);
    }

    // Fallback for non-secure contexts or legacy browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (fallbackErr) {
      console.error("Clipboard copy fallback failed:", fallbackErr);
    }
  };

  const deep = scoreData.deepDive;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Action / Toolbar Header (Hidden in Print) */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-700">
            Verified Premium Report • ID: <code className="text-stone-500">{resultId.slice(0, 14)}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share Link"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-stone-200 shadow-sm space-y-12 print:border-none print:shadow-none print:p-0">
        {/* Cover / Title Block */}
        <div className="border-b border-stone-200 pb-8 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-800 bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
              ECR-R Clinical Psychological Profile
            </span>
            <span className="text-xs text-stone-400" suppressHydrationWarning>
              Report Generated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight mb-2">
            {scoreData.archetypeTitle}
          </h1>

          <p className="text-base sm:text-lg font-medium text-rose-900 italic mb-4">
            Relational Shadow: {scoreData.shadowSubtype}
          </p>

          <p className="text-stone-600 text-sm leading-relaxed max-w-3xl">
            {scoreData.shortSummary}
          </p>
        </div>

        {/* Section 1: Attachment Spectrum Chart */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              1
            </span>
            <span>Two-Dimensional Coordinate Spectrum</span>
          </h2>
          <AttachmentSpectrumVisual
            anxiousPercent={scoreData.anxiousPercent}
            avoidantPercent={scoreData.avoidantPercent}
            archetype={scoreData.archetype}
          />
        </div>

        {/* Section 2: Core Subconscious Fear & Drive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Core Subconscious Fear</span>
            </div>
            <p className="text-stone-800 text-sm leading-relaxed font-medium">
              {deep.coreFear}
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 text-amber-700" />
              <span>Subconscious Emotional Drive</span>
            </div>
            <p className="text-stone-800 text-sm leading-relaxed font-medium">
              {deep.subconsciousDrive}
            </p>
          </div>
        </div>

        {/* Section 3: Childhood Origin Blueprint */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              2
            </span>
            <span>The Childhood Origin Blueprint</span>
          </h2>
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed">
              {deep.childhoodBlueprint}
            </p>
          </div>
        </div>

        {/* Section 4: Romantic Magnet Trap */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              3
            </span>
            <span>The Romantic Magnet Trap</span>
          </h2>
          <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200">
            <p className="text-rose-950 text-sm sm:text-base leading-relaxed">
              {deep.romanticTrap}
            </p>
          </div>
        </div>

        {/* Section 5: The 3 Toxic Triggers */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              4
            </span>
            <span>Your 3 Toxic Deactivation & Panic Triggers</span>
          </h2>
          <div className="space-y-3">
            {deep.toxicTriggers.map((trig, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex items-start gap-3.5"
              >
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-stone-800 text-sm leading-relaxed">{trig}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Word-for-Word Communication Fixes */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              5
            </span>
            <span>Communication Re-Wires: What to Say Instead</span>
          </h2>
          <div className="space-y-4">
            {deep.communicationFixes.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-stone-200 overflow-hidden"
              >
                <div className="bg-rose-50/40 p-4 border-b border-rose-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                    Automatic Shadow Impulse:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 italic">
                    &ldquo;{item.impulse}&rdquo;
                  </p>
                </div>
                <div className="bg-emerald-50/40 p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Healthy Grounded Script:
                  </span>
                  <p className="text-xs sm:text-sm text-stone-900 font-medium">
                    &ldquo;{item.healthyReframe}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Partner Compatibility Matrix */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              6
            </span>
            <span>Relational Compatibility Matrix</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>With a Secure Partner</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {deep.compatibilityAnalysis.withSecure}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>With an Anxious Partner</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {deep.compatibilityAnalysis.withAnxious}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>With an Avoidant Partner</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {deep.compatibilityAnalysis.withAvoidant}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
              <h3 className="font-serif font-bold text-sm text-stone-900 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>With a Fearful-Avoidant Partner</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {deep.compatibilityAnalysis.withFearful}
              </p>
            </div>
          </div>
        </div>

        {/* Section 8: The 30-Day Rewiring Roadmap */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700">
              7
            </span>
            <span>Your Customized 30-Day Subconscious Rewiring Action Plan</span>
          </h2>
          <div className="space-y-4">
            {deep.actionPlan30Days.map((phase, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-2xl p-5 border border-stone-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {phase.phase}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
                    {phase.days}
                  </span>
                </div>
                <div className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">
                  Focus: {phase.focus}
                </div>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                  <strong>Daily Practice:</strong> {phase.exercise}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Disclaimer in Report */}
        <div className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-400">
          <p className="max-w-xl mx-auto leading-relaxed">
            Report Reference ID: {resultId} • For educational & self-development use only. If you need any assistance or have questions regarding your assessment report, please contact our support team at support@yourdomain.com.
          </p>
        </div>
      </div>
    </div>
  );
}
