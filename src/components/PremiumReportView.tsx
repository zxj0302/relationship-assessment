"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { AttachmentSpectrumVisual } from "@/components/AttachmentSpectrumVisual";
import {
  AttachmentArchetype,
  ScoreBreakdown,
  RelationshipStatus,
} from "@/types/assessment";
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
  Users,
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
  ArrowDown,
  Copy,
  Check,
  Quote,
  XCircle,
  CheckCircle2,
} from "lucide-react";

const RELATIONSHIP_STATUS_CONTEXT: Record<
  RelationshipStatus,
  { badge: string; focusTitle: string; strategy: string }
> = {
  single: {
    badge: "Context: Single & Reflecting",
    focusTitle: "Pre-Dating Pattern Interruption",
    strategy:
      "Use this period of autonomy to recalibrate your 'chemistry radar.' Before entering a new connection, audit your past 2 relationships against the Attraction Loop in Section 2 so you can spot familiar red flags during the first 3 dates rather than after emotional attachment has formed.",
  },
  dating: {
    badge: "Context: Dating / Early Stage",
    focusTitle: "Pacing Intimacy & Early Trigger Regulation",
    strategy:
      "Early dating activates ambiguity and projection. Focus on pacing vulnerability gradually rather than rushing into premature fusion or pulling away at the first sign of imperfection. Use the Communication Scripts in Section 6 to state your needs early without testing.",
  },
  in_relationship: {
    badge: "Context: Committed Partnership",
    focusTitle: "Breaking Recurring Friction & Co-Regulation",
    strategy:
      "In established partnerships, childhood attachment imprints surface during routine stress or unspoken resentment. Focus heavily on Section 3 (Conflict Shadow) and Section 6 (Communication Scripts) to replace automatic defensive reflexes with collaborative repair.",
  },
  complicated: {
    badge: "Context: Complicated / On-and-Off Cycle",
    focusTitle: "Exiting the Anxious-Avoidant Rollercoaster",
    strategy:
      "On-and-off dynamics thrive on intermittent reinforcement—where the relief of reconciliation is mistaken for deep compatibility. Pay close attention to Section 2 (The Breaking Point) and establish firm, non-negotiable consistency standards over the next 30 days.",
  },
  healing: {
    badge: "Context: Healing from a Recent Breakup",
    focusTitle: "Nervous System Detox & Self-Retrieval",
    strategy:
      "Post-breakup distress is physiological as much as emotional. Avoid romanticizing the relationship's highs or blaming yourself for the rupture. Prioritize Weeks 1–2 of the 30-Day Rewiring Plan in Section 8 to ground your nervous system and reclaim your internal center of gravity.",
  },
};

const CHAPTER_NAV = [
  { id: "sec-coordinates", num: "01", label: "Coordinates" },
  { id: "sec-attraction", num: "02", label: "Attraction" },
  { id: "sec-conflict", num: "03", label: "Conflict" },
  { id: "sec-origin", num: "04", label: "Origin" },
  { id: "sec-triggers", num: "05", label: "Triggers" },
  { id: "sec-scripts", num: "06", label: "Scripts" },
  { id: "sec-compatibility", num: "07", label: "Compatibility" },
  { id: "sec-plan", num: "08", label: "30-Day Plan" },
];

type PartnerTabKey = "Secure" | "Anxious" | "Avoidant" | "Fearful";

const SYNERGY_MATRIX: Record<
  AttachmentArchetype,
  Record<PartnerTabKey, { score: number; status: string }>
> = {
  Secure: {
    Secure: { score: 94, status: "Optimal Harmony & Mutual Growth" },
    Anxious: { score: 84, status: "Stabilizing Anchor (Boundaries Needed)" },
    Avoidant: { score: 80, status: "Respectful Space & Gentle Bridge" },
    Fearful: { score: 74, status: "Safe Harbor (Requires Patience)" },
  },
  "Anxious-Preoccupied": {
    Secure: { score: 88, status: "Ideal Healing & Grounding Match" },
    Anxious: { score: 58, status: "High Empathy • Enmeshment Risk" },
    Avoidant: { score: 34, status: "High Friction • Pursuit–Withdrawal Loop" },
    Fearful: { score: 38, status: "High Volatility • Push–Pull Triggers" },
  },
  "Dismissive-Avoidant": {
    Secure: { score: 86, status: "Safe Autonomy & Gradual Trust" },
    Anxious: { score: 34, status: "High Friction • Demand–Retreat Polarity" },
    Avoidant: { score: 52, status: "Low Conflict • Emotional Distance Risk" },
    Fearful: { score: 36, status: "Unpredictable Boundaries & Standoff" },
  },
  "Fearful-Avoidant": {
    Secure: { score: 84, status: "Most Restorative & Steady Anchor" },
    Anxious: { score: 38, status: "Intense Chemistry • Trigger Spiral" },
    Avoidant: { score: 36, status: "Guarded Stalemate & Abandonment Ache" },
    Fearful: { score: 29, status: "Extreme Polarity • Burnout Risk" },
  },
};

interface ReportViewProps {
  scoreData: ScoreBreakdown;
  resultId: string;
  isUnlocked: boolean;
  token?: string;
}

function copyTextWithFallback(text: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackExecCopy(text));
  }
  return Promise.resolve(fallbackExecCopy(text));
}

function fallbackExecCopy(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

export function PremiumReportView({
  scoreData,
  resultId,
  isUnlocked,
  token,
}: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [mantraCopied, setMantraCopied] = useState(false);
  const [copiedScriptIdx, setCopiedScriptIdx] = useState<number | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [activeChapter, setActiveChapter] = useState<string>("sec-coordinates");
  const [activePartnerTab, setActivePartnerTab] = useState<PartnerTabKey>(
    scoreData.archetype === "Anxious-Preoccupied"
      ? "Avoidant"
      : scoreData.archetype === "Dismissive-Avoidant"
      ? "Anxious"
      : "Secure"
  );
  const [completedPhases, setCompletedPhases] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (token && typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        let shouldReplace = false;
        if (url.searchParams.has("session_id")) {
          url.searchParams.delete("session_id");
          url.searchParams.set("token", token);
          shouldReplace = true;
        } else if (!url.searchParams.has("token")) {
          url.searchParams.set("token", token);
          shouldReplace = true;
        }
        if (shouldReplace) {
          window.history.replaceState({}, "", url.toString());
        }
        localStorage.setItem(`unlocked_report_token_${resultId}`, token);
      } catch (err) {
        console.warn("Failed to persist token to URL/storage:", err);
      }
    }
  }, [token, resultId]);

  // Restore saved 30-day action plan checklist state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`report_plan_checks_${resultId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setCompletedPhases(parsed);
        }
      }
    } catch {
      // Safe ignore
    }
  }, [resultId]);

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

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

  // Scroll-spy for sticky chapter bar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const elements = CHAPTER_NAV.map((c) => document.getElementById(c.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveChapter(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0.05 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = token
      ? `${window.location.origin}/report/${resultId}?token=${encodeURIComponent(token)}`
      : window.location.href;
    if (await copyTextWithFallback(shareUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyInvite = async () => {
    if (typeof window === "undefined") return;
    const inviteUrl = `${window.location.origin}/quiz?ref=${resultId.slice(0, 8)}`;
    if (await copyTextWithFallback(inviteUrl)) {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    }
  };

  const handleCopyMantra = async (text: string) => {
    if (await copyTextWithFallback(text)) {
      setMantraCopied(true);
      setTimeout(() => setMantraCopied(false), 2000);
    }
  };

  const handleCopyScript = async (text: string, idx: number) => {
    if (await copyTextWithFallback(text)) {
      setCopiedScriptIdx(idx);
      setTimeout(() => setCopiedScriptIdx(null), 2000);
    }
  };

  const togglePhaseCompleted = (idx: number) => {
    setCompletedPhases((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      try {
        localStorage.setItem(`report_plan_checks_${resultId}`, JSON.stringify(next));
      } catch {
        // Safe ignore
      }
      return next;
    });
  };

  const scrollToChapter = (id: string) => {
    setActiveChapter(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 128;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const deep = scoreData.deepDive;
  const attraction = scoreData.partnerAttractionWarning;
  const conflict = scoreData.conflictShadow;
  const wound = scoreData.childhoodWound;
  const statusKey: RelationshipStatus = scoreData.relationshipStatus || "single";
  const statusContext =
    RELATIONSHIP_STATUS_CONTEXT[statusKey] || RELATIONSHIP_STATUS_CONTEXT.single;

  const conflictPercent = Math.min(
    100,
    Math.max(0, Math.round((((scoreData.conflictRaw || 3) - 1) / 4) * 100))
  );
  const childhoodPercent = Math.min(
    100,
    Math.max(0, Math.round((((scoreData.childhoodRaw || 3) - 1) / 4) * 100))
  );

  const dimensionMetrics = [
    {
      label: "Attachment Anxiety",
      items: "Q1–Q6",
      percent: scoreData.anxiousPercent,
      raw: scoreData.anxiousRaw,
      barColor: "bg-rose-600",
      level:
        scoreData.anxiousPercent > 60
          ? "Elevated Sensitivity"
          : scoreData.anxiousPercent > 35
          ? "Moderate"
          : "Grounded",
    },
    {
      label: "Intimacy Avoidance",
      items: "Q7–Q12",
      percent: scoreData.avoidantPercent,
      raw: scoreData.avoidantRaw,
      barColor: "bg-sky-600",
      level:
        scoreData.avoidantPercent > 60
          ? "High Guard"
          : scoreData.avoidantPercent > 35
          ? "Moderate Guard"
          : "Open",
    },
    {
      label: "Conflict Reactivity",
      items: "Q13–Q18",
      percent: conflictPercent,
      raw: scoreData.conflictRaw || 3.0,
      barColor: "bg-amber-600",
      level:
        conflictPercent > 60
          ? `Active ${conflict?.shadowType || "Stress"} Reflex`
          : conflictPercent > 35
          ? "Situational"
          : "Co-Regulated",
    },
    {
      label: "Childhood Imprint",
      items: "Q19–Q24",
      percent: childhoodPercent,
      raw: scoreData.childhoodRaw || 3.0,
      barColor: "bg-purple-600",
      level:
        childhoodPercent > 60
          ? "Deep Conditioning"
          : childhoodPercent > 35
          ? "Moderate Imprint"
          : "Secure Base",
    },
  ];

  const synergyMap =
    SYNERGY_MATRIX[scoreData.archetype] || SYNERGY_MATRIX.Secure;

  const compatibilityTabs: {
    key: PartnerTabKey;
    shortTitle: string;
    fullTitle: string;
    tag: string;
    text: string;
    accentPill: string;
    barColor: string;
    cardStyle: string;
  }[] = [
    {
      key: "Secure",
      shortTitle: "Secure Partner",
      fullTitle: "With a Secure Partner",
      tag: "Anchor Dynamics",
      text: deep.compatibilityAnalysis?.withSecure || "",
      accentPill: "bg-emerald-100 text-emerald-900 border-emerald-200",
      barColor: "bg-emerald-500",
      cardStyle: "border-emerald-200 bg-emerald-50/40",
    },
    {
      key: "Anxious",
      shortTitle: "Anxious Partner",
      fullTitle: "With an Anxious-Preoccupied Partner",
      tag: "Intimacy & Fusion",
      text: deep.compatibilityAnalysis?.withAnxious || "",
      accentPill: "bg-rose-100 text-rose-900 border-rose-200",
      barColor: "bg-rose-500",
      cardStyle: "border-rose-200 bg-rose-50/40",
    },
    {
      key: "Avoidant",
      shortTitle: "Avoidant Partner",
      fullTitle: "With a Dismissive-Avoidant Partner",
      tag: "Autonomy & Space",
      text: deep.compatibilityAnalysis?.withAvoidant || "",
      accentPill: "bg-sky-100 text-sky-900 border-sky-200",
      barColor: "bg-sky-500",
      cardStyle: "border-sky-200 bg-sky-50/40",
    },
    {
      key: "Fearful",
      shortTitle: "Fearful Partner",
      fullTitle: "With a Fearful-Avoidant Partner",
      tag: "Polarity & Push-Pull",
      text: deep.compatibilityAnalysis?.withFearful || "",
      accentPill: "bg-purple-100 text-purple-900 border-purple-200",
      barColor: "bg-purple-500",
      cardStyle: "border-purple-200 bg-purple-50/40",
    },
  ];

  const selectedCompatibility =
    compatibilityTabs.find((t) => t.key === activePartnerTab) ||
    compatibilityTabs[0];
  const selectedSynergy = synergyMap[selectedCompatibility.key];

  const completedCount = Object.values(completedPhases).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Action / Toolbar Header (Hidden in Print) */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-700">
            Verified Premium Analysis • Portal ID:{" "}
            <code className="text-stone-500 font-mono">{resultId.slice(0, 14)}</code>
          </span>
          {token && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <KeyRound className="w-3 h-3 text-emerald-600" />
              <span>Permanent Access</span>
            </span>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial justify-center whitespace-nowrap flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span>{copied ? "Link Copied!" : "Share / Bookmark"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial justify-center whitespace-nowrap flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Sticky Chapter Quick-Jump Bar (Hidden in Print) */}
      <nav
        aria-label="Report Sections"
        className="no-print sticky top-[68px] z-30 mb-6 bg-white/90 backdrop-blur-md border border-stone-200/90 rounded-2xl p-1.5 shadow-sm overflow-x-auto"
      >
        <div className="flex items-center gap-1 min-w-max">
          {CHAPTER_NAV.map((ch) => {
            const isActive = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => scrollToChapter(ch.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? "text-rose-300" : "text-stone-400"
                  }`}
                >
                  {ch.num}
                </span>
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Report Container */}
      <div className="space-y-12 bg-white p-6 sm:p-12 rounded-3xl border border-stone-200/90 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Cover Header */}
        <div className="border-b border-stone-100 pb-8 text-center sm:text-left print:break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="inline-block text-xs uppercase tracking-widest font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                8-Module Attachment Dossier
              </span>
              <span className="inline-block text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                {statusContext.badge}
              </span>
            </div>
            <span className="text-xs text-stone-400 font-mono">
              Generated: {formattedDate || "Recent"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-2 mb-2">
            {scoreData.archetypeTitle}
          </h1>

          <p className="text-base sm:text-lg font-medium text-rose-800">
            Shadow Subtype: &ldquo;{scoreData.shadowSubtype}&rdquo;
          </p>

          <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-2xl">
            {scoreData.shortSummary}
          </p>

          {/* Personalized Relationship Stage Callout */}
          <div className="mt-6 bg-gradient-to-r from-rose-50/80 via-orange-50/50 to-stone-50 border-l-4 border-l-rose-700 border border-stone-200/80 rounded-r-2xl p-4 sm:p-5 text-left">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-700" />
              <span>Personalized Lens • {statusContext.focusTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {statusContext.strategy}
            </p>
          </div>
        </div>

        {/* =========================================================
            SECTION 1: COORDINATES & 4-DIMENSION SCOREBOARD
        ========================================================= */}
        <section id="sec-coordinates" className="scroll-mt-32 print:break-inside-avoid">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
              01
            </span>
            <Compass className="w-5 h-5 text-rose-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Attachment Coordinates &amp; Sub-Scales
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed">
            Your 24 responses mapped across the two-dimensional ECR-R framework and four underlying behavioral sub-scales.
          </p>

          <AttachmentSpectrumVisual
            anxiousPercent={scoreData.anxiousPercent}
            avoidantPercent={scoreData.avoidantPercent}
            archetype={scoreData.archetype}
          />

          {/* Compact 4-Dimension Scoreboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {dimensionMetrics.map((dim) => (
              <div
                key={dim.label}
                className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono mb-1">
                    <span>{dim.items}</span>
                    <span>{dim.raw}/5.0</span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 leading-snug">{dim.label}</p>
                </div>

                <div className="mt-3">
                  <div className="mb-1">
                    <span className="text-lg font-extrabold text-stone-900 leading-none">
                      {dim.percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dim.barColor}`}
                      style={{ width: `${dim.percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-stone-600 leading-tight">
                    {dim.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 2: SUBCONSCIOUS ATTRACTION LOOP (SPOTLIGHT + SPLIT)
        ========================================================= */}
        {attraction && (
          <section
            id="sec-attraction"
            className="scroll-mt-32 print:break-inside-avoid"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                02
              </span>
              <Flame className="w-5 h-5 text-rose-700" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Your Subconscious Attraction Loop
              </h2>
            </div>

            {/* Dark Spotlight Banner for Magnetized Partner */}
            <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-md mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] uppercase tracking-widest font-bold text-rose-300">
                  The Partner Archetype You Magnetize
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-stone-200 border border-white/15">
                  Chemistry Pattern
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                {attraction.drawnToType}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {attraction.whyAttracted}
              </p>

              {/* Compact 2-Column Drive vs Trap inside Spotlight */}
              <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10 text-xs">
                <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-1">
                    Subconscious Drive
                  </span>
                  <p className="text-stone-200 leading-relaxed">
                    {deep.subconsciousDrive}
                  </p>
                </div>
                <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
                  <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] block mb-1">
                    Core Romantic Trap
                  </span>
                  <p className="text-stone-200 leading-relaxed">
                    {deep.romanticTrap}
                  </p>
                </div>
              </div>
            </div>

            {/* Contrast Pair: Rupture Point vs Rewiring Antidote */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Where It Breaks Down
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {attraction.theBreakingPoint}
                </p>
              </div>

              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    The Rewiring Antidote
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {attraction.antidote}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 3: CONFLICT SHADOW (3-STEP CAUSAL FLOW DIAGRAM)
        ========================================================= */}
        {conflict && (
          <section
            id="sec-conflict"
            className="scroll-mt-32 print:break-inside-avoid"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                  03
                </span>
                <KeyRound className="w-5 h-5 text-amber-700" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Conflict Shadow Pathway
                </h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {conflict.title}
              </span>
            </div>

            {/* 3-Step Visual Chain: Trigger -> Reflex -> Reset */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
              {/* Step 1: Trigger */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block">
                      Step 1 • Stimulus
                    </span>
                    <strong className="text-xs font-bold text-stone-900">
                      Stress Trigger
                    </strong>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {conflict.trigger}
                </p>
              </div>

              {/* Connector 1 */}
              <div className="flex items-center justify-center py-1 md:py-0 text-stone-300">
                <ArrowRight className="hidden md:block w-5 h-5" />
                <ArrowDown className="md:hidden w-4 h-4" />
              </div>

              {/* Step 2: Involuntary Armor */}
              <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200/80 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-rose-700/70 block">
                      Step 2 • Autonomic Reflex
                    </span>
                    <strong className="text-xs font-bold text-rose-950">
                      Default Defense
                    </strong>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {conflict.defaultReaction}
                </p>
              </div>

              {/* Connector 2 */}
              <div className="flex items-center justify-center py-1 md:py-0 text-stone-300">
                <ArrowRight className="hidden md:block w-5 h-5" />
                <ArrowDown className="md:hidden w-4 h-4" />
              </div>

              {/* Step 3: Somatic Reset */}
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-700/70 block">
                      Step 3 • Regulation
                    </span>
                    <strong className="text-xs font-bold text-emerald-950">
                      Nervous System Reset
                    </strong>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {conflict.nervousSystemReframe}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 4: CHILDHOOD BLUEPRINT (EDITORIAL QUOTE LAYOUT)
        ========================================================= */}
        {wound && (
          <section
            id="sec-origin"
            className="scroll-mt-32 print:break-inside-avoid"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                  04
                </span>
                <BookOpen className="w-5 h-5 text-stone-700" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">
                  Early Imprint &amp; Unconscious Contract
                </h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {wound.title}
              </span>
            </div>

            <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200">
              {/* Editorial Pull-Quote for Subconscious Contract */}
              <div className="relative bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm mb-6">
                <Quote className="w-8 h-8 text-rose-100 absolute top-4 right-5 pointer-events-none" />
                <span className="text-[11px] uppercase tracking-widest font-bold text-rose-800 block mb-2">
                  Your Childhood Subconscious Rule
                </span>
                <p className="font-serif text-lg sm:text-xl font-bold text-stone-900 italic leading-snug">
                  &ldquo;{wound.subconsciousContract}&rdquo;
                </p>
              </div>

              {/* Two-Column Editorial Narrative */}
              <div className="grid sm:grid-cols-2 gap-6 text-xs sm:text-sm text-stone-700 mb-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Developmental Origin
                  </h4>
                  <p className="leading-relaxed">{deep.childhoodBlueprint}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Core Attachment Fear
                  </h4>
                  <p className="leading-relaxed font-medium text-stone-800">
                    {wound.coreFear}
                  </p>
                  {deep.coreFear && deep.coreFear !== wound.coreFear && (
                    <p className="text-xs text-stone-500 mt-2.5 pt-2.5 border-t border-stone-200/70 leading-relaxed">
                      <strong>Root Vulnerability:</strong> {deep.coreFear}
                    </p>
                  )}
                </div>
              </div>

              {/* Daily Mantra Banner with Copy Button */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900 text-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-300 block mb-1">
                    Daily Reparenting Affirmation
                  </span>
                  <p className="font-serif text-sm sm:text-base italic text-white">
                    &ldquo;{wound.healingMantra}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyMantra(wound.healingMantra)}
                  className="no-print shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
                >
                  {mantraCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Mantra</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 5: TOXIC DEACTIVATION TRIGGERS (ACCENT CARDS)
        ========================================================= */}
        <section
          id="sec-triggers"
          className="scroll-mt-32 print:break-inside-avoid"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
              05
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Primary Nervous System Triggers
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {deep.toxicTriggers.map((trigger, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-stone-200 border-t-4 border-t-rose-600 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 block mb-2">
                    Trigger 0{idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                    {trigger}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 6: COMMUNICATION SCRIPTS (CHAT BUBBLES + COPY)
        ========================================================= */}
        <section
          id="sec-scripts"
          className="scroll-mt-32 print:break-inside-avoid"
        >
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                06
              </span>
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                High-Stakes Communication Scripts
              </h2>
            </div>
            <span className="no-print hidden sm:inline text-xs text-stone-400">
              Tap &ldquo;Copy Script&rdquo; to save verbatim phrasing
            </span>
          </div>

          <div className="space-y-4">
            {deep.communicationFixes.map((fix, idx) => {
              const isScriptCopied = copiedScriptIdx === idx;
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-3xl bg-stone-50 border border-stone-200 grid grid-cols-1 md:grid-cols-[1fr_auto_1.15fr] items-center gap-3.5"
                >
                  {/* Left: Old Impulse */}
                  <div className="p-4 bg-white/80 rounded-2xl border border-rose-200/70 h-full flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-rose-700 mb-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Old Protective Reflex</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {fix.impulse}
                    </p>
                  </div>

                  {/* Center Arrow */}
                  <div className="flex justify-center text-stone-400">
                    <ArrowRight className="hidden md:block w-5 h-5" />
                    <ArrowDown className="md:hidden w-4 h-4" />
                  </div>

                  {/* Right: Verbatim Secure Chat Bubble */}
                  <div className="p-4 bg-emerald-50/90 rounded-2xl rounded-tl-sm border border-emerald-300/80 shadow-sm h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Secure Verbatim Script</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyScript(fix.healthyReframe, idx)}
                        className="no-print inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition"
                      >
                        {isScriptCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-900 font-medium leading-relaxed">
                      &ldquo;{fix.healthyReframe}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            SECTION 7: PARTNER COMPATIBILITY (INTERACTIVE TABS + METER)
        ========================================================= */}
        {deep.compatibilityAnalysis && (
          <section
            id="sec-compatibility"
            className="scroll-mt-32 print:break-inside-avoid"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                07
              </span>
              <Users className="w-5 h-5 text-rose-700" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Partner Compatibility Matrix
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-stone-500 mb-5 leading-relaxed">
              Select a partner attachment style below to inspect your relational synergy, triggers, and growth potential.
            </p>

            {/* Interactive Tab View (Screen Only) */}
            <div className="print:hidden">
              <div
                role="tablist"
                aria-label="Partner Attachment Styles"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-stone-100 p-1.5 rounded-2xl border border-stone-200"
              >
                {compatibilityTabs.map((tab) => {
                  const isSelected = tab.key === activePartnerTab;
                  const tabSynergy = synergyMap[tab.key];
                  return (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={isSelected}
                      type="button"
                      onClick={() => setActivePartnerTab(tab.key)}
                      className={`py-2.5 px-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold"
                          : "text-stone-600 hover:text-stone-900 hover:bg-white/50 font-medium"
                      }`}
                    >
                      <span className="text-xs block truncate">
                        {tab.shortTitle}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        Harmony: {tabSynergy.score}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Partner Detail Card */}
              <div
                className={`p-6 rounded-3xl border transition-all ${selectedCompatibility.cardStyle}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span
                      className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-1.5 ${selectedCompatibility.accentPill}`}
                    >
                      {selectedCompatibility.tag}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {scoreData.archetype} + {selectedCompatibility.shortTitle}
                    </h3>
                  </div>

                  {/* Harmony Score Meter */}
                  <div className="bg-white/90 px-4 py-2.5 rounded-2xl border border-stone-200/80 min-w-[180px]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-500 font-medium">
                        Baseline Ease
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {selectedSynergy.score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${selectedCompatibility.barColor}`}
                        style={{ width: `${selectedSynergy.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      {selectedSynergy.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-stone-800 leading-relaxed bg-white/80 p-4 rounded-2xl border border-stone-200/60">
                  {selectedCompatibility.text}
                </p>
              </div>
            </div>

            {/* Full 4-Card Grid Fallback for Print / PDF Export */}
            <div className="hidden print:grid print:grid-cols-2 print:gap-4">
              {compatibilityTabs.map((tab) => (
                <div
                  key={tab.key}
                  className={`p-4 rounded-2xl border ${tab.cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">
                      {tab.fullTitle}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-stone-600">
                      {synergyMap[tab.key].score}% Ease
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {tab.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 8: 30-DAY REWIRING ROADMAP (TIMELINE + CHECKLIST)
        ========================================================= */}
        <section id="sec-plan" className="scroll-mt-32 print:break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-stone-900 text-rose-300">
                08
              </span>
              <Clock className="w-5 h-5 text-rose-700" />
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                30-Day Subconscious Rewiring Roadmap
              </h2>
            </div>

            <span className="no-print text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {completedCount} of {deep.actionPlan30Days.length} Milestones Checked
            </span>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-[11px] sm:before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-stone-200">
            {deep.actionPlan30Days.map((step, idx) => {
              const isDone = !!completedPhases[idx];
              return (
                <div key={idx} className="relative">
                  {/* Timeline Node */}
                  <button
                    type="button"
                    onClick={() => togglePhaseCompleted(idx)}
                    aria-label={`Mark ${step.phase} complete`}
                    className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "bg-white border-rose-300 text-rose-800 hover:border-rose-600"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </button>

                  {/* Timeline Card */}
                  <div
                    onClick={() => togglePhaseCompleted(idx)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-white border-stone-200 hover:border-rose-300 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-md border border-rose-200">
                          {step.days}
                        </span>
                        <h3
                          className={`text-sm sm:text-base font-bold ${
                            isDone
                              ? "line-through text-stone-500"
                              : "text-stone-900"
                          }`}
                        >
                          {step.phase.replace(/^Phase \d+:\s*/, "")}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-stone-500">
                        Focus: {step.focus}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      <strong className="text-stone-900">Practice:</strong>{" "}
                      {step.exercise}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Viral Loop & Partner Compatibility Invite (Hidden in Print) */}
        <div className="no-print pt-6 border-t border-stone-200">
          <div className="bg-gradient-to-r from-rose-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-800 text-rose-200 mb-3">
                <Heart className="w-3.5 h-3.5" /> Couple Compatibility Referral
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
            Attachment Style &amp; Relationship Shadow Assessment &copy;{" "}
            {new Date().getFullYear()}. All rights reserved.
          </p>
          <p className="mt-1">
            Clinical Disclaimer: This assessment is an educational and self-reflection instrument derived from psychological attachment theory frameworks. It is not intended as medical, psychiatric, or psychological diagnosis or treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
