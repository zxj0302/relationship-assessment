import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

import { stripe } from "@/lib/stripe";
import { signResultToken } from "@/lib/jwt";
import { AttachmentArchetype } from "@/types/assessment";

const VALID_ARCHETYPES: AttachmentArchetype[] = [
  "Secure",
  "Anxious-Preoccupied",
  "Dismissive-Avoidant",
  "Fearful-Avoidant",
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function getAppUrl(req: NextRequest): string {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Prioritize explicitly configured NEXT_PUBLIC_APP_URL (reject localhost if in production)
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) {
    const isLocalhost = configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1");
    if (!(isProduction && isLocalhost)) {
      return configuredUrl.replace(/\/+$/, "");
    }
  }

  // 2. Derive dynamically from reverse proxy headers if available
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0].trim();
    return `${forwardedProto}://${host}`.replace(/\/+$/, "");
  }

  const host = req.headers.get("host");
  if (host) {
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = req.headers.get("x-forwarded-proto") || (isLocalhost ? "http" : "https");
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  // 3. Fallback to req.nextUrl.origin
  if (req.nextUrl?.origin && req.nextUrl.origin !== "null") {
    return req.nextUrl.origin.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, anxiousRaw, avoidantRaw, anxiousPercent, avoidantPercent, archetype } = body;

    // 1. Validate Archetype Whitelist
    if (!archetype || !VALID_ARCHETYPES.includes(archetype as AttachmentArchetype)) {
      return NextResponse.json(
        { error: "Invalid or missing attachment archetype specification" },
        { status: 400 }
      );
    }

    // 2. Validate Raw Scores (Likert scale 1.0 - 5.0)
    const numAnxiousRaw = Number(anxiousRaw);
    const numAvoidantRaw = Number(avoidantRaw);
    if (
      Number.isNaN(numAnxiousRaw) ||
      Number.isNaN(numAvoidantRaw) ||
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
    const numAnxiousPercent = Number(anxiousPercent);
    const numAvoidantPercent = Number(avoidantPercent);
    if (
      Number.isNaN(numAnxiousPercent) ||
      Number.isNaN(numAvoidantPercent) ||
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

    const appUrl = getAppUrl(req);
    const resultId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create an unlocked signed token that can be verified in report upon completion
    const unlockedToken = await signResultToken({
      resultId,
      email: validatedEmail,
      anxiousRaw: numAnxiousRaw,
      avoidantRaw: numAvoidantRaw,
      anxiousPercent: numAnxiousPercent,
      avoidantPercent: numAvoidantPercent,
      archetype: archetype as AttachmentArchetype,
      isUnlocked: true,
      createdAt: Date.now(),
    });

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
      return NextResponse.json({
        url: `${appUrl}/report/${resultId}?token=${unlockedToken}&mock_success=true`,
        mock: true,
      });
    }

    // Official Stripe Checkout Session Creation ($14.99 USD)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: validatedEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 1499, // $14.99 in cents
            product_data: {
              name: "Full 12-Page Attachment & Relationship Shadow Assessment Report",
              description: `Deep subconscious blueprint, 30-Day Rewiring Plan, and Partner Compatibility Analysis for ${archetype}.`,
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
        archetype,
        anxiousRaw: String(numAnxiousRaw),
        avoidantRaw: String(numAvoidantRaw),
        anxiousPercent: String(numAnxiousPercent),
        avoidantPercent: String(numAvoidantPercent),
      },
      success_url: `${appUrl}/report/${resultId}?session_id={CHECKOUT_SESSION_ID}&token=${unlockedToken}`,
      cancel_url: `${appUrl}/results/teaser?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Checkout creation error:", err);
    const message = err instanceof Error ? err.message : "Failed to initiate payment session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
