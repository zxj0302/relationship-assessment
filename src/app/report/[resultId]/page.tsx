import { verifyResultToken, signResultToken } from "@/lib/jwt";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import {
  calculateAssessmentScores,
  getPartnerAttractionWarning,
  getDefaultConflictShadow,
  getDefaultChildhoodWound,
} from "@/lib/scoring";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import { AttachmentArchetype, RelationshipStatus } from "@/types/assessment";
import { PremiumReportView } from "@/components/PremiumReportView";
import { ReportUnlockClientFallback } from "@/components/ReportUnlockClientFallback";
import { PaymentStatusRefreshButton } from "@/components/PaymentStatusRefreshButton";
import Link from "next/link";
import { Lock, ArrowRight, Clock } from "lucide-react";
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

const VALID_RELATIONSHIP_STATUSES: RelationshipStatus[] = [
  "single",
  "dating",
  "in_relationship",
  "complicated",
  "healing",
];

interface ReportPageProps {
  params: {
    resultId: string;
  };
  searchParams: {
    token?: string | string[];
    session_id?: string | string[];
    mock_success?: string | string[];
    archetype?: string | string[];
    status?: string | string[];
  };
}

function parseBoundedNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (val === undefined || val === null || String(val).trim() === "") {
    return fallback;
  }
  const num = Number(val);
  return Number.isFinite(num) && num >= min && num <= max ? num : fallback;
}

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { resultId } = params;
  const token = typeof searchParams.token === "string" ? searchParams.token : Array.isArray(searchParams.token) ? searchParams.token[0] : undefined;
  const session_id = typeof searchParams.session_id === "string" ? searchParams.session_id : Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : undefined;
  const mock_success = typeof searchParams.mock_success === "string" ? searchParams.mock_success : Array.isArray(searchParams.mock_success) ? searchParams.mock_success[0] : undefined;
  const mockArchetypeParam = typeof searchParams.archetype === "string" ? searchParams.archetype : Array.isArray(searchParams.archetype) ? searchParams.archetype[0] : undefined;
  const mockStatusParam = typeof searchParams.status === "string" ? searchParams.status : Array.isArray(searchParams.status) ? searchParams.status[0] : undefined;

  let isUnlocked = false;
  let isPendingSettlement = false;
  let activeToken: string | undefined = undefined;
  let targetArchetype: AttachmentArchetype = "Secure";
  let anxiousRaw = 3.0;
  let avoidantRaw = 3.0;
  let anxiousPercent = 50;
  let avoidantPercent = 50;
  let relationshipStatus: RelationshipStatus = "single";
  let userAnswers: Record<number, number> | undefined = undefined;

  // 1. Verify via signed JWT token if present (with strict resultId and isUnlocked matching)
  if (token) {
    const verified = await verifyResultToken(token);
    if (verified && verified.isUnlocked && verified.resultId === resultId) {
      isUnlocked = true;
      activeToken = token;
      if (VALID_ARCHETYPES.includes(verified.archetype)) {
        targetArchetype = verified.archetype;
      }
      anxiousRaw = parseBoundedNumber(verified.anxiousRaw, 1, 5, 3.0);
      avoidantRaw = parseBoundedNumber(verified.avoidantRaw, 1, 5, 3.0);
      anxiousPercent = parseBoundedNumber(verified.anxiousPercent, 0, 100, 50);
      avoidantPercent = parseBoundedNumber(verified.avoidantPercent, 0, 100, 50);
      if (
        verified.relationshipStatus &&
        VALID_RELATIONSHIP_STATUSES.includes(verified.relationshipStatus)
      ) {
        relationshipStatus = verified.relationshipStatus;
      }
      if (
        verified.answers &&
        typeof verified.answers === "object" &&
        !Array.isArray(verified.answers) &&
        Object.keys(verified.answers).length > 0
      ) {
        userAnswers = verified.answers;
      }
    }
  }

  // 2. Verify via Stripe Checkout Session ID (ensuring payment status is explicitly 'paid')
  if (!isUnlocked && session_id && !session_id.includes("placeholder")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid" && session.metadata?.resultId === resultId) {
        isUnlocked = true;
        const customerEmail = session.customer_details?.email || undefined;
        if (session.metadata) {
          if (session.metadata.archetype) {
            const metaArchetype = session.metadata.archetype as AttachmentArchetype;
            if (VALID_ARCHETYPES.includes(metaArchetype)) {
              targetArchetype = metaArchetype;
            }
          }
          anxiousRaw = parseBoundedNumber(session.metadata.anxiousRaw, 1, 5, anxiousRaw);
          avoidantRaw = parseBoundedNumber(session.metadata.avoidantRaw, 1, 5, avoidantRaw);
          anxiousPercent = parseBoundedNumber(session.metadata.anxiousPercent, 0, 100, anxiousPercent);
          avoidantPercent = parseBoundedNumber(session.metadata.avoidantPercent, 0, 100, avoidantPercent);
          if (
            session.metadata.relationshipStatus &&
            VALID_RELATIONSHIP_STATUSES.includes(session.metadata.relationshipStatus as RelationshipStatus)
          ) {
            relationshipStatus = session.metadata.relationshipStatus as RelationshipStatus;
          }
          if (session.metadata.answers) {
            try {
              const parsed = JSON.parse(session.metadata.answers);
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                userAnswers = parsed;
              }
            } catch (jsonErr) {
              console.warn("Failed to parse answers from session metadata:", jsonErr);
            }
          }
        }

        // Issue permanent signed JWT token on the server so client can persist it and avoid repeated Stripe API calls
        try {
          activeToken = await signResultToken({
            resultId,
            email: customerEmail,
            anxiousRaw,
            avoidantRaw,
            anxiousPercent,
            avoidantPercent,
            archetype: targetArchetype,
            relationshipStatus,
            answers: userAnswers,
            isUnlocked: true,
            createdAt: Date.now(),
          });
        } catch (tokenErr) {
          console.warn("Failed to sign permanent result token after session verification:", tokenErr);
        }
      } else if (
        session.metadata?.resultId === resultId &&
        session.status === "complete" &&
        (session.payment_status === "unpaid" || (session.payment_status as string) === "processing")
      ) {
        isPendingSettlement = true;
      }
    } catch (err) {
      console.error("Stripe session retrieval verification error:", err);
    }
  }

  // 3. Fallback for mock demo success (strictly limited to non-production development environments)
  if (!isUnlocked && mock_success === "true" && process.env.NODE_ENV !== "production") {
    isUnlocked = true;
    if (mockArchetypeParam && VALID_ARCHETYPES.includes(mockArchetypeParam as AttachmentArchetype)) {
      targetArchetype = mockArchetypeParam as AttachmentArchetype;
    }
    if (mockStatusParam && VALID_RELATIONSHIP_STATUSES.includes(mockStatusParam as RelationshipStatus)) {
      relationshipStatus = mockStatusParam as RelationshipStatus;
    }
    if (targetArchetype === "Anxious-Preoccupied") {
      anxiousPercent = 78;
      avoidantPercent = 24;
      anxiousRaw = 4.1;
      avoidantRaw = 2.0;
    } else if (targetArchetype === "Dismissive-Avoidant") {
      anxiousPercent = 22;
      avoidantPercent = 81;
      anxiousRaw = 1.9;
      avoidantRaw = 4.2;
    } else if (targetArchetype === "Fearful-Avoidant") {
      anxiousPercent = 76;
      avoidantPercent = 74;
      anxiousRaw = 4.0;
      avoidantRaw = 3.9;
    } else {
      anxiousPercent = 24;
      avoidantPercent = 20;
      anxiousRaw = 2.0;
      avoidantRaw = 1.8;
    }
    try {
      activeToken = await signResultToken({
        resultId,
        anxiousRaw,
        avoidantRaw,
        anxiousPercent,
        avoidantPercent,
        archetype: targetArchetype,
        relationshipStatus,
        answers: userAnswers,
        isUnlocked: true,
        createdAt: Date.now(),
      });
    } catch {
      // Safe fallback
    }
  }

  // Guard: If payment was completed but settlement is pending (delayed payment methods)
  if (isPendingSettlement) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-3">
          Payment Processing & Settlement Pending
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-6">
          Your payment was submitted successfully and is currently being processed by your bank or payment provider.
          Once the transaction settles, your comprehensive 8-module report will unlock automatically.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left mb-8 space-y-2">
          <p className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
            Please do not submit another payment
          </p>
          <p>
            Depending on your payment method (e.g. bank transfer, iDEAL, SEPA, or asynchronous clearing), confirmation can take anywhere from a few minutes to several business hours. We have securely saved your assessment data.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <PaymentStatusRefreshButton />
          <Link
            href="/quiz"
            className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-semibold text-stone-600 hover:text-stone-900 px-4 py-3"
          >
            Return to Assessment
          </Link>
        </div>
      </div>
    );
  }

  // Guard: If not verified/unlocked, display locked access gate
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <ReportUnlockClientFallback resultId={resultId} />
        <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-3">
          This Report is Currently Locked
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          The comprehensive 8-module psychological analysis for this assessment ID has not yet been unlocked or your verification session has expired.
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

  // Accurately compute score breakdown based on genuine user answers without any hardcoded fake data
  const scoreData = calculateAssessmentScores(userAnswers || {}, relationshipStatus);

  // If userAnswers was missing (edge fallback), overlay verified dimensional metrics
  if (!userAnswers || Object.keys(userAnswers).length === 0) {
    scoreData.anxiousRaw = anxiousRaw;
    scoreData.avoidantRaw = avoidantRaw;
    scoreData.anxiousPercent = anxiousPercent;
    scoreData.avoidantPercent = avoidantPercent;
    scoreData.conflictRaw = Number(Math.max(anxiousRaw, avoidantRaw, 2.2).toFixed(2));
    scoreData.childhoodRaw = Number((((anxiousRaw + avoidantRaw) / 2) * 0.95).toFixed(2));
    scoreData.archetype = targetArchetype;
    const profile = ARCHETYPE_PROFILES[targetArchetype] || ARCHETYPE_PROFILES["Secure"];
    scoreData.archetypeTitle = profile.archetypeTitle;
    scoreData.shadowSubtype = profile.shadowSubtype;
    scoreData.shortSummary = profile.shortSummary;
    scoreData.deepDive = profile.deepDive;
    scoreData.conflictShadow = getDefaultConflictShadow(targetArchetype);
    scoreData.childhoodWound = getDefaultChildhoodWound(targetArchetype);
    scoreData.partnerAttractionWarning = getPartnerAttractionWarning(targetArchetype);
  } else if (targetArchetype && scoreData.archetype !== targetArchetype) {
    scoreData.archetype = targetArchetype;
    const profile = ARCHETYPE_PROFILES[targetArchetype] || ARCHETYPE_PROFILES["Secure"];
    scoreData.archetypeTitle = profile.archetypeTitle;
    scoreData.shadowSubtype = profile.shadowSubtype;
    scoreData.shortSummary = profile.shortSummary;
    scoreData.deepDive = profile.deepDive;
    scoreData.conflictShadow = getDefaultConflictShadow(targetArchetype);
    scoreData.childhoodWound = getDefaultChildhoodWound(targetArchetype);
    scoreData.partnerAttractionWarning = getPartnerAttractionWarning(targetArchetype);
  }

  return (
    <PremiumReportView
      scoreData={scoreData}
      resultId={resultId}
      isUnlocked={isUnlocked}
      token={activeToken}
    />
  );
}
