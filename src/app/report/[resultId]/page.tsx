import { verifyResultToken } from "@/lib/jwt";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import { AttachmentArchetype, ScoreBreakdown } from "@/types/assessment";
import { PremiumReportView } from "@/components/PremiumReportView";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Psychological Shadow Report",
  description: "Your personalized attachment style analysis and recovery roadmap.",
};

const VALID_ARCHETYPES: AttachmentArchetype[] = [
  "Secure",
  "Anxious-Preoccupied",
  "Dismissive-Avoidant",
  "Fearful-Avoidant",
];

interface ReportPageProps {
  params: {
    resultId: string;
  };
  searchParams: {
    token?: string;
    session_id?: string;
    mock_success?: string;
  };
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { resultId } = params;
  const { token, session_id, mock_success } = searchParams;

  let isUnlocked = false;
  let targetArchetype: AttachmentArchetype = "Anxious-Preoccupied";
  let anxiousRaw = 4.15;
  let avoidantRaw = 2.1;
  let anxiousPercent = 79;
  let avoidantPercent = 28;

  // 1. Verify via signed JWT token if present (with strict resultId matching)
  if (token) {
    const verified = await verifyResultToken(token);
    if (verified && verified.isUnlocked && verified.resultId === resultId) {
      isUnlocked = true;
      if (VALID_ARCHETYPES.includes(verified.archetype)) {
        targetArchetype = verified.archetype;
      }
      if (!Number.isNaN(verified.anxiousRaw) && verified.anxiousRaw >= 1 && verified.anxiousRaw <= 5) {
        anxiousRaw = verified.anxiousRaw;
      }
      if (!Number.isNaN(verified.avoidantRaw) && verified.avoidantRaw >= 1 && verified.avoidantRaw <= 5) {
        avoidantRaw = verified.avoidantRaw;
      }
      if (!Number.isNaN(verified.anxiousPercent) && verified.anxiousPercent >= 0 && verified.anxiousPercent <= 100) {
        anxiousPercent = verified.anxiousPercent;
      }
      if (!Number.isNaN(verified.avoidantPercent) && verified.avoidantPercent >= 0 && verified.avoidantPercent <= 100) {
        avoidantPercent = verified.avoidantPercent;
      }
    }
  }

  // 2. Verify via Stripe Checkout Session ID (ensuring session belongs to this resultId)
  if (!isUnlocked && session_id && !session_id.includes("placeholder")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid" && session.metadata?.resultId === resultId) {
        isUnlocked = true;
        if (session.metadata?.archetype) {
          const metaArchetype = session.metadata.archetype as AttachmentArchetype;
          if (VALID_ARCHETYPES.includes(metaArchetype)) {
            targetArchetype = metaArchetype;
          }
          const rawAnx = Number(session.metadata.anxiousRaw);
          if (!Number.isNaN(rawAnx) && rawAnx >= 1 && rawAnx <= 5) {
            anxiousRaw = rawAnx;
          }
          const rawAvo = Number(session.metadata.avoidantRaw);
          if (!Number.isNaN(rawAvo) && rawAvo >= 1 && rawAvo <= 5) {
            avoidantRaw = rawAvo;
          }
          const pctAnx = Number(session.metadata.anxiousPercent);
          if (!Number.isNaN(pctAnx) && pctAnx >= 0 && pctAnx <= 100) {
            anxiousPercent = pctAnx;
          }
          const pctAvo = Number(session.metadata.avoidantPercent);
          if (!Number.isNaN(pctAvo) && pctAvo >= 0 && pctAvo <= 100) {
            avoidantPercent = pctAvo;
          }
        }
      }
    } catch (err) {
      console.error("Stripe session retrieval verification error:", err);
    }
  }

  // 3. Fallback for mock demo success (strictly limited to non-production development environments)
  if (!isUnlocked && mock_success === "true" && process.env.NODE_ENV !== "production") {
    isUnlocked = true;
  }

  // Guard: If not unlocked, display locked access gate
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-3">
          This Report is Currently Locked
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          The comprehensive 12-page psychological analysis for this assessment ID has not yet been unlocked or your verification session has expired.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/results/teaser"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow transition"
          >
            <span>Unlock Your Report ($14.99)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/quiz"
            className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-semibold text-stone-600 hover:text-stone-900 px-4 py-3"
          >
            Retake Free Assessment
          </Link>
        </div>
      </div>
    );
  }

  const profile = ARCHETYPE_PROFILES[targetArchetype] || ARCHETYPE_PROFILES["Anxious-Preoccupied"];

  const scoreData: ScoreBreakdown = {
    anxiousRaw,
    anxiousPercent,
    avoidantRaw,
    avoidantPercent,
    archetype: targetArchetype,
    archetypeTitle: profile.archetypeTitle,
    shadowSubtype: profile.shadowSubtype,
    shortSummary: profile.shortSummary,
    deepDive: profile.deepDive,
  };

  return (
    <PremiumReportView
      scoreData={scoreData}
      resultId={resultId}
      isUnlocked={isUnlocked}
    />
  );
}
