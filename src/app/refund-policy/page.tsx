import React from "react";
import { ShieldCheck, Mail } from "lucide-react";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - Attachment & Shadow Lab",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-stone-800">
      <div className="flex items-center gap-2 mb-2 text-rose-800">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span className="text-xs uppercase font-bold tracking-wider">Customer Protection</span>
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
        14-Day 100% Money-Back Guarantee
      </h1>
      <p className="text-xs text-stone-500 mb-8">Effective Date: October 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-stone-600">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-emerald-950">
          <h2 className="font-serif font-bold text-lg mb-2">Our Hassle-Free Commitment</h2>
          <p className="text-xs sm:text-sm leading-relaxed">
            We are confident that our 8-module comprehensive assessment report provides meaningful self-reflection value and actionable clarity. However, if for any reason you are not completely satisfied with your report, we offer a <strong>100% full refund within 14 days of purchase</strong> — no questions asked.
          </p>
        </div>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">How to Request a Refund</h2>
          <p className="mb-3">
            To initiate your refund, simply send an email to our dedicated support address:
          </p>
          <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 inline-flex items-center gap-2 text-stone-900 font-mono text-sm">
            <Mail className="w-4 h-4 text-stone-500" />
            <a href={`mailto:${APP_CONFIG.supportEmail}`} className="hover:underline">
              {APP_CONFIG.supportEmail}
            </a>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Please include the email address used at checkout or your Report ID. Refunds are issued directly to your original payment method via Stripe within 2 to 5 business days.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">Why We Offer This Guarantee</h2>
          <p>
            We adhere strictly to Stripe and card network best practices. Transparent refund policies eliminate friction, foster trust, and ensure customer satisfaction.
          </p>
        </section>
      </div>
    </div>
  );
}
