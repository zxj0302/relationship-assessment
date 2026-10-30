import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { sendReportUnlockEmail } from "@/lib/email";
import { signResultToken } from "@/lib/jwt";
import { AttachmentArchetype } from "@/types/assessment";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret || webhookSecret.includes("placeholder")) {
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
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
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
    const archetype = (metadata.archetype as AttachmentArchetype) || "Secure";
    const numAnxiousRaw = Number(metadata.anxiousRaw) || 3.0;
    const numAvoidantRaw = Number(metadata.avoidantRaw) || 3.0;
    const numAnxiousPercent = Number(metadata.anxiousPercent) || 50;
    const numAvoidantPercent = Number(metadata.avoidantPercent) || 50;

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
          isUnlocked: true,
          createdAt: Date.now(),
        });
      } catch (tokenErr) {
        console.error("[Stripe Webhook] Failed to sign unlocked token:", tokenErr);
      }
    }

    // Prioritize dynamically inferred appUrl from checkout metadata, then env, preventing localhost leaks in production
    let appUrl = metadata.appUrl?.trim() || "";
    if (isProduction && (appUrl.includes("localhost") || appUrl.includes("127.0.0.1"))) {
      appUrl = "";
    }
    if (!appUrl) {
      const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
      if (configured && !(isProduction && (configured.includes("localhost") || configured.includes("127.0.0.1")))) {
        appUrl = configured;
      } else {
        appUrl = isProduction ? "https://attachment-shadow-report.com" : "http://localhost:3000";
      }
    }
    appUrl = appUrl.replace(/\/+$/, "");

    const reportUrl = `${appUrl}/report/${resultId}?token=${unlockedToken || ""}`;

    console.log(
      `[Stripe Webhook] Payment confirmed for session: ${session.id}, Event: ${event.type}, User: ${userEmail || "none"}`
    );

    if (userEmail && resultId && unlockedToken) {
      try {
        const emailResult = await sendReportUnlockEmail({
          toEmail: userEmail,
          reportUrl,
          archetypeTitle: archetype,
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
