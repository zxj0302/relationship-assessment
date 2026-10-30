import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { sendReportUnlockEmail } from "@/lib/email";
import { signResultToken } from "@/lib/jwt";
import { getAppUrl } from "@/lib/url";
import { ARCHETYPE_PROFILES } from "@/data/archetypes";
import { AttachmentArchetype, RelationshipStatus } from "@/types/assessment";
import Stripe from "stripe";

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

function parseBoundedNumber(val: unknown, min: number, max: number, fallback: number): number {
  if (val === undefined || val === null || String(val).trim() === "") {
    return fallback;
  }
  const num = Number(val);
  return Number.isFinite(num) && num >= min && num <= max ? num : fallback;
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  let event: Stripe.Event;

  try {
    if (
      !sig ||
      !webhookSecret ||
      webhookSecret.includes("placeholder") ||
      webhookSecret === "whsec_..."
    ) {
      // In production, missing signature or webhook secret is strictly disallowed
      if (isProduction) {
        console.error("[Stripe Webhook] Missing stripe-signature header or unconfigured webhook secret in production.");
        return NextResponse.json(
          { error: "Webhook Error: Missing stripe-signature or valid webhook secret" },
          { status: 400 }
        );
      }

      console.warn("[Stripe Webhook] Webhook secret or signature missing; handling mock/dev event.");
      event = JSON.parse(payload) as Stripe.Event;
    } else {
      // Must use constructEventAsync in Edge Runtime environment
      event = await stripe.webhooks.constructEventAsync(payload, sig, webhookSecret);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown verification failure";
    console.error(`Webhook signature verification failed: ${errorMsg}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
  }

  // Handle successful checkout event (supports instant payments & async payment fulfillments)
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    // Strict payment verification: Only dispatch email if payment status is explicitly "paid"
    // For delayed payment methods (SEPA, bank transfers, Klarna), wait until checkout.session.async_payment_succeeded
    if (session.payment_status !== "paid") {
      console.log(
        `[Stripe Webhook] Session ${session.id} payment_status is '${session.payment_status}'. Deferring report unlock email.`
      );
      return NextResponse.json({ received: true, status: "deferred_pending_payment" });
    }

    const metadata = session.metadata || {};

    // Validate and sanitize customer email:
    // Prioritize verified metadata.email; fallback to session customer_details if valid and not CLI dummy
    const metaEmail = metadata.email?.trim();
    const customerEmail = session.customer_details?.email?.trim();

    let userEmail: string | null = null;
    if (metaEmail && metaEmail.includes("@") && metaEmail !== "customer@example.com") {
      userEmail = metaEmail;
    } else if (
      customerEmail &&
      customerEmail.includes("@") &&
      customerEmail !== "customer@example.com"
    ) {
      userEmail = customerEmail;
    }

    const resultId = metadata.resultId;
    const archetype: AttachmentArchetype =
      metadata.archetype && VALID_ARCHETYPES.includes(metadata.archetype as AttachmentArchetype)
        ? (metadata.archetype as AttachmentArchetype)
        : "Secure";
    const numAnxiousRaw = parseBoundedNumber(metadata.anxiousRaw, 1, 5, 3.0);
    const numAvoidantRaw = parseBoundedNumber(metadata.avoidantRaw, 1, 5, 3.0);
    const numAnxiousPercent = parseBoundedNumber(metadata.anxiousPercent, 0, 100, 50);
    const numAvoidantPercent = parseBoundedNumber(metadata.avoidantPercent, 0, 100, 50);
    const relationshipStatus: RelationshipStatus | undefined =
      metadata.relationshipStatus &&
      VALID_RELATIONSHIP_STATUSES.includes(metadata.relationshipStatus as RelationshipStatus)
        ? (metadata.relationshipStatus as RelationshipStatus)
        : undefined;

    let parsedAnswers: Record<number, number> | undefined = undefined;
    if (metadata.answers) {
      try {
        const parsed = JSON.parse(metadata.answers);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          parsedAnswers = parsed;
        }
      } catch (parseErr) {
        console.warn("[Stripe Webhook] Failed to parse answers metadata JSON:", parseErr);
      }
    }

    // Dynamically sign unlocked result token from verified session metadata
    let unlockedToken: string | null = null;
    if (resultId) {
      try {
        unlockedToken = await signResultToken({
          resultId,
          email: userEmail || undefined,
          anxiousRaw: numAnxiousRaw,
          avoidantRaw: numAvoidantRaw,
          anxiousPercent: numAnxiousPercent,
          avoidantPercent: numAvoidantPercent,
          archetype,
          relationshipStatus,
          answers: parsedAnswers,
          isUnlocked: true,
          createdAt: Date.now(),
        });
      } catch (tokenErr) {
        console.error("[Stripe Webhook] Failed to sign unlocked token:", tokenErr);
      }
    }

    const appUrl = getAppUrl(req, metadata.appUrl);
    const reportUrl = `${appUrl}/report/${resultId}?token=${unlockedToken || ""}`;

    console.log(
      `[Stripe Webhook] Payment confirmed for session: ${session.id}, Event: ${event.type}, User: ${userEmail || "none"}`
    );

    if (userEmail && resultId && unlockedToken) {
      try {
        const fullArchetypeTitle = ARCHETYPE_PROFILES[archetype]?.archetypeTitle || archetype;
        const emailResult = await sendReportUnlockEmail({
          toEmail: userEmail,
          reportUrl,
          archetypeTitle: fullArchetypeTitle,
        });
        if (!emailResult.success) {
          console.error(`[Stripe Webhook] Failed to dispatch unlock email to ${userEmail}:`, emailResult.error);
        } else {
          console.log(`[Stripe Webhook] Report unlock email successfully dispatched to ${userEmail} (mocked: ${!!emailResult.mocked})`);
        }
      } catch (emailErr) {
        console.error("[Stripe Webhook] Unexpected error triggering Resend confirmation email:", emailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
