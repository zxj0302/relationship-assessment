import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { signResultToken } from "@/lib/jwt";
import { getAppUrl } from "@/lib/url";
import { calculateAssessmentScores } from "@/lib/scoring";
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

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  try {
    const {
      email,
      anxiousRaw,
      avoidantRaw,
      anxiousPercent,
      avoidantPercent,
      archetype,
      relationshipStatus,
      answers,
    } = body || {};

    // 1. Validate Archetype Whitelist
    if (!archetype || !VALID_ARCHETYPES.includes(archetype as AttachmentArchetype)) {
      return NextResponse.json(
        { error: "Invalid or missing attachment archetype specification" },
        { status: 400 }
      );
    }

    // 2. Validate Raw Scores (Likert scale 1.0 - 5.0)
    const isNonEmptyValue = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== "";
    const numAnxiousRaw = isNonEmptyValue(anxiousRaw) ? Number(anxiousRaw) : NaN;
    const numAvoidantRaw = isNonEmptyValue(avoidantRaw) ? Number(avoidantRaw) : NaN;
    if (
      !Number.isFinite(numAnxiousRaw) ||
      !Number.isFinite(numAvoidantRaw) ||
      numAnxiousRaw < 1.0 ||
      numAnxiousRaw > 5.0 ||
      numAvoidantRaw < 1.0 ||
      numAvoidantRaw > 5.0
    ) {
      return NextResponse.json(
        { error: "Raw dimension scores must be numbers within range [1.0, 5.0]" },
        { status: 400 }
      );
    }

    // 3. Validate Percentage Scores (0 - 100)
    const numAnxiousPercent = isNonEmptyValue(anxiousPercent) ? Number(anxiousPercent) : NaN;
    const numAvoidantPercent = isNonEmptyValue(avoidantPercent) ? Number(avoidantPercent) : NaN;
    if (
      !Number.isFinite(numAnxiousPercent) ||
      !Number.isFinite(numAvoidantPercent) ||
      numAnxiousPercent < 0 ||
      numAnxiousPercent > 100 ||
      numAvoidantPercent < 0 ||
      numAvoidantPercent > 100
    ) {
      return NextResponse.json(
        { error: "Percentage dimension scores must be numbers within range [0, 100]" },
        { status: 400 }
      );
    }

    // 4. Validate Email Format
    let validatedEmail: string | undefined = undefined;
    if (email) {
      if (typeof email !== "string" || email.length > 254 || !EMAIL_REGEX.test(email.trim())) {
        return NextResponse.json(
          { error: "Invalid email address format" },
          { status: 400 }
        );
      }
      validatedEmail = email.trim();
    }

    // 5. Validate Relationship Status
    const validatedRelationshipStatus: RelationshipStatus =
      typeof relationshipStatus === "string" && VALID_RELATIONSHIP_STATUSES.includes(relationshipStatus as RelationshipStatus)
        ? (relationshipStatus as RelationshipStatus)
        : "single";

    // 6. Validate & Sanitize 24 Questions Answer Dictionary (strict bounds [1, 24] and integer Likert [1, 5])
    let serializedAnswers = "{}";
    const validatedAnswers: Record<number, number> = {};
    if (answers && typeof answers === "object" && !Array.isArray(answers)) {
      for (const [key, val] of Object.entries(answers)) {
        const qId = Number(key);
        const scoreVal = Number(val);
        if (
          Number.isInteger(qId) &&
          qId >= 1 &&
          qId <= 24 &&
          Number.isInteger(scoreVal) &&
          scoreVal >= 1 &&
          scoreVal <= 5
        ) {
          validatedAnswers[qId] = scoreVal;
        }
      }
      serializedAnswers = JSON.stringify(validatedAnswers);
    }

    // 7. Authoritative Server-Side Score Recalculation
    let authoritativeArchetype: AttachmentArchetype = archetype as AttachmentArchetype;
    let authoritativeAnxiousRaw = numAnxiousRaw;
    let authoritativeAvoidantRaw = numAvoidantRaw;
    let authoritativeAnxiousPercent = numAnxiousPercent;
    let authoritativeAvoidantPercent = numAvoidantPercent;

    if (Object.keys(validatedAnswers).length > 0) {
      const computedScores = calculateAssessmentScores(validatedAnswers, validatedRelationshipStatus);
      authoritativeArchetype = computedScores.archetype;
      authoritativeAnxiousRaw = computedScores.anxiousRaw;
      authoritativeAvoidantRaw = computedScores.avoidantRaw;
      authoritativeAnxiousPercent = computedScores.anxiousPercent;
      authoritativeAvoidantPercent = computedScores.avoidantPercent;
    }

    const appUrl = getAppUrl(req);
    const resultId = `res_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

    // Check if Stripe Secret is placeholder (Development/Demo Mode)
    const isProduction = process.env.NODE_ENV === "production";
    const isMockStripe =
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes("placeholder") ||
      process.env.STRIPE_SECRET_KEY === "sk_test_...";

    if (isMockStripe) {
      if (isProduction) {
        console.error(
          "[Stripe Security Alert] STRIPE_SECRET_KEY is missing or unconfigured in production environment."
        );
        return NextResponse.json(
          { error: "Payment service is currently unavailable. Please contact support." },
          { status: 500 }
        );
      }

      console.warn(
        "[Stripe Warning] STRIPE_SECRET_KEY not configured. Simulating successful instant checkout for preview in development."
      );
      // In dev mock mode only, issue a signed token for demonstration
      const mockUnlockedToken = await signResultToken({
        resultId,
        email: validatedEmail,
        anxiousRaw: authoritativeAnxiousRaw,
        avoidantRaw: authoritativeAvoidantRaw,
        anxiousPercent: authoritativeAnxiousPercent,
        avoidantPercent: authoritativeAvoidantPercent,
        archetype: authoritativeArchetype,
        relationshipStatus: validatedRelationshipStatus,
        answers: validatedAnswers,
        isUnlocked: true,
        createdAt: Date.now(),
      });
      return NextResponse.json({
        url: `${appUrl}/report/${resultId}?token=${mockUnlockedToken}&mock_success=true`,
        mock: true,
      });
    }

    // Official Stripe Checkout Session Creation ($14.99 USD)
    // NOTE: We NEVER issue an unlocked token in success_url before payment verification
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: validatedEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 1499, // $14.99 in cents
            product_data: {
              name: "Full 8-Module Attachment & Relationship Shadow Assessment Report",
              description: `Deep subconscious blueprint, 30-Day Rewiring Plan, and Partner Compatibility Analysis for ${authoritativeArchetype}.`,
              tax_code: "txcd_10000000",
              images: [
                "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
              ],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        resultId,
        email: validatedEmail || "",
        appUrl,
        archetype: authoritativeArchetype,
        relationshipStatus: validatedRelationshipStatus,
        anxiousRaw: String(authoritativeAnxiousRaw),
        avoidantRaw: String(authoritativeAvoidantRaw),
        anxiousPercent: String(authoritativeAnxiousPercent),
        avoidantPercent: String(authoritativeAvoidantPercent),
        answers: serializedAnswers,
      },
      // Secure success_url: only session_id is returned, verification happens server-side via Stripe API
      success_url: `${appUrl}/report/${resultId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/results/teaser?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Checkout creation error:", err);
    const message = err instanceof Error ? err.message : "Failed to initiate payment session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
