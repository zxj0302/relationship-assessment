import React from "react";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy - Attachment & Shadow Lab",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-stone-800">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
        Privacy Policy
      </h1>
      <p className="text-xs text-stone-500 mb-8">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-stone-600">
        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">1. Commitment to Confidentiality</h2>
          <p>
            We take your relational privacy with supreme seriousness. We do not sell, rent, or trade your personal responses, assessment answers, or email addresses to data brokers or third parties.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">2. Information We Collect</h2>
          <p>
            When you take the free assessment, individual responses are scored in-session to generate your dimension coordinates. When you purchase a report, we collect your email address solely to deliver your digital report access link and purchase receipts via Resend.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">3. Payment Information Security</h2>
          <p>
            All payment card information is processed directly by Stripe using encrypted tokenization compliant with PCI-DSS Level 1 standards. We never see or store your raw credit card numbers.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">4. Data Deletion Rights</h2>
          <p>
            You may request complete removal of your email and generated report records at any time by emailing {APP_CONFIG.privacyEmail}.
          </p>
        </section>
      </div>
    </div>
  );
}
