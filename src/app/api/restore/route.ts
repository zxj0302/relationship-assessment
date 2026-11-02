import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { signResultToken } from "@/lib/jwt";
import { AttachmentArchetype, RelationshipStatus } from "@/types/assessment";

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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Lightweight per-isolate sliding-window rate limiter to deter 4-digit brute-force attempts
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5;
const failedAttempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (failedAttempts.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= MAX_ATTEMPTS_PER_WINDOW) {
    failedAttempts.set(key, timestamps);
    return true;
  }
  return false;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const timestamps = (failedAttempts.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  failedAttempts.set(key, timestamps);
}

function parseBoundedNumber(
  val: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (val === undefined || val === null || String(val).trim() === "") {
    return fallback;
  }
  const num = Number(val);
  return Number.isFinite(num) && num >= min && num <= max ? num : fallback;
}

function normalizeCode(input: string): string {
  return input.trim().replace(/^[#\s]+/, "").toLowerCase();
}

function matchesSessionVerification(
  session: Stripe.Checkout.Session,
  rawVerification: string
): boolean {
  const cleaned = normalizeCode(rawVerification);
  if (cleaned.length < 4) return false;

  const digitsOnly = cleaned.replace(/[^0-9]/g, "");
  const candidateTokens = new Set<string>();
  const candidateLast4 = new Set<string>();

  // 1. Check Session / Metadata IDs
  if (session.id) candidateTokens.add(session.id.toLowerCase());
  if (session.metadata?.resultId) {
    const rid = session.metadata.resultId.toLowerCase();
    candidateTokens.add(rid);
    if (rid.length >= 6) {
      candidateTokens.add(rid.slice(0, 14));
    }
  }

  // 2. Check expanded PaymentIntent & Latest Charge details
  const pi = session.payment_intent;
  if (pi && typeof pi === "object") {
    if (pi.id) candidateTokens.add(pi.id.toLowerCase());
    const charge = pi.latest_charge;
    if (charge && typeof charge === "object") {
      if (charge.receipt_number) {
        const rn = charge.receipt_number.toLowerCase();
        candidateTokens.add(rn);
        candidateTokens.add(rn.replace(/[^a-z0-9]/g, ""));
        const rnDigits = rn.replace(/[^0-9]/g, "");
        if (rnDigits.length >= 4) {
          candidateLast4.add(rnDigits.slice(-4));
        }
      }

      const pmd = charge.payment_method_details;
      if (pmd) {
        if (pmd.card?.last4) candidateLast4.add(pmd.card.last4);
        if (pmd.us_bank_account?.last4) candidateLast4.add(pmd.us_bank_account.last4);
        if (pmd.sepa_debit?.last4) candidateLast4.add(pmd.sepa_debit.last4);
        if (pmd.bacs_debit?.last4) candidateLast4.add(pmd.bacs_debit.last4);
        if (pmd.acss_debit?.last4) candidateLast4.add(pmd.acss_debit.last4);
      }
    }
  }

  // 3. Check expanded Invoice number (Managed Payments tax invoice / receipt)
  const inv = session.invoice;
  if (inv && typeof inv === "object" && inv.number) {
    const invNum = inv.number.toLowerCase();
    candidateTokens.add(invNum);
    candidateTokens.add(invNum.replace(/[^a-z0-9]/g, ""));
    const invDigits = invNum.replace(/[^0-9]/g, "");
    if (invDigits.length >= 4) {
      candidateLast4.add(invDigits.slice(-4));
    }
  }

  // Exact match on full receipt/invoice/session/result ID
  const compactCleaned = cleaned.replace(/[^a-z0-9_]/g, "");
  if (candidateTokens.has(cleaned) || (compactCleaned.length >= 6 && candidateTokens.has(compactCleaned))) {
    return true;
  }

  // Exact 4-digit match on card/bank last4 or trailing 4 digits of receipt/invoice number
  if (/^\d{4}$/.test(cleaned) && candidateLast4.has(cleaned)) {
    return true;
  }
  if (digitsOnly.length === 4 && cleaned.length <= 6 && candidateLast4.has(digitsOnly)) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const rawVerification =
    typeof body.verification === "string" ? body.verification.trim() : "";

  if (!rawEmail || rawEmail.length > 254 || !EMAIL_REGEX.test(rawEmail)) {
    return NextResponse.json(
      { error: "Please enter a valid checkout email address." },
      { status: 400 }
    );
  }

  if (!rawVerification || normalizeCode(rawVerification).length < 4 || rawVerification.length > 80) {
    return NextResponse.json(
      {
        error:
          "Please enter the last 4 digits of your payment card or your Stripe receipt number.",
      },
      { status: 400 }
    );
  }

  const clientIp =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown_ip";

  const ipKey = `ip:${clientIp}`;
  const emailKey = `email:${rawEmail}`;

  if (isRateLimited(ipKey) || isRateLimited(emailKey)) {
    return NextResponse.json(
      {
        error:
          "Too many verification attempts. Please wait 10 minutes before trying again or contact support.",
      },
      { status: 429 }
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isMockStripe =
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY.includes("placeholder") ||
    process.env.STRIPE_SECRET_KEY === "sk_test_...";

  // Local development mock mode (strictly disabled in production)
  if (isMockStripe) {
    if (isProduction) {
      return NextResponse.json(
        { error: "Restore service is temporarily unavailable. Please contact support." },
        { status: 500 }
      );
    }

    if (normalizeCode(rawVerification) === "4242") {
      const mockResultId = `res_restored_dev_${Date.now()}`;
      const mockToken = await signResultToken({
        resultId: mockResultId,
        email: rawEmail,
        anxiousRaw: 4.1,
        avoidantRaw: 2.0,
        anxiousPercent: 78,
        avoidantPercent: 24,
        archetype: "Anxious-Preoccupied",
        relationshipStatus: "single",
        isUnlocked: true,
        createdAt: Date.now(),
      });
      return NextResponse.json({
        url: `/report/${mockResultId}?token=${encodeURIComponent(mockToken)}`,
      });
    }

    recordFailedAttempt(ipKey);
    recordFailedAttempt(emailKey);
    return NextResponse.json(
      {
        error:
          "Could not match a completed purchase with those details (Tip: in local dev mode without Stripe keys, use 4242).",
      },
      { status: 404 }
    );
  }

  try {
    const sessionsList = await stripe.checkout.sessions.list({
      customer_details: { email: rawEmail },
      limit: 15,
      expand: ["data.payment_intent.latest_charge", "data.invoice"],
    });

    const paidSessions = (sessionsList.data || []).filter(
      (s) => s.payment_status === "paid" && Boolean(s.metadata?.resultId)
    );

    const matchedSession = paidSessions.find((s) =>
      matchesSessionVerification(s, rawVerification)
    );

    if (!matchedSession || !matchedSession.metadata?.resultId) {
      recordFailedAttempt(ipKey);
      recordFailedAttempt(emailKey);
      return NextResponse.json(
        {
          error:
            "We could not match a completed purchase with those details. Please check your checkout email and the 4 digits or receipt number on your Stripe receipt.",
        },
        { status: 404 }
      );
    }

    const meta = matchedSession.metadata;
    const resultId = meta.resultId;
    const archetype: AttachmentArchetype = VALID_ARCHETYPES.includes(
      meta.archetype as AttachmentArchetype
    )
      ? (meta.archetype as AttachmentArchetype)
      : "Secure";
    const relationshipStatus: RelationshipStatus = VALID_RELATIONSHIP_STATUSES.includes(
      meta.relationshipStatus as RelationshipStatus
    )
      ? (meta.relationshipStatus as RelationshipStatus)
      : "single";

    const anxiousRaw = parseBoundedNumber(meta.anxiousRaw, 1, 5, 3.0);
    const avoidantRaw = parseBoundedNumber(meta.avoidantRaw, 1, 5, 3.0);
    const anxiousPercent = parseBoundedNumber(meta.anxiousPercent, 0, 100, 50);
    const avoidantPercent = parseBoundedNumber(meta.avoidantPercent, 0, 100, 50);

    let answers: Record<number, number> | undefined = undefined;
    if (meta.answers) {
      try {
        const parsed = JSON.parse(meta.answers);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          answers = parsed;
        }
      } catch {
        // Safe ignore
      }
    }

    const token = await signResultToken({
      resultId,
      email: rawEmail,
      anxiousRaw,
      avoidantRaw,
      anxiousPercent,
      avoidantPercent,
      archetype,
      relationshipStatus,
      answers,
      isUnlocked: true,
      createdAt: matchedSession.created ? matchedSession.created * 1000 : Date.now(),
    });

    return NextResponse.json({
      url: `/report/${resultId}?token=${encodeURIComponent(token)}`,
    });
  } catch (err) {
    console.error("[Restore Report Error]:", err);
    return NextResponse.json(
      {
        error:
          "Unable to verify purchase records right now. Please try again in a moment or contact support.",
      },
      { status: 500 }
    );
  }
}
