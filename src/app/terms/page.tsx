import React from "react";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service - Attachment & Shadow Lab",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 text-stone-800">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
        Terms of Service
      </h1>
      <p className="text-xs text-stone-500 mb-8">Last Updated: October 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-stone-600">
        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">1. Nature of the Service</h2>
          <p>
            Attachment & Shadow Lab provides self-assessment tools, psychometric profiling, and educational materials based on contemporary attachment research (Experiences in Close Relationships - Revised, ECR-R). This digital service is intended solely for personal self-development, education, and informational purposes.
          </p>
        </section>

        <section className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900">
          <h2 className="font-bold text-base mb-1">2. Explicit Medical & Clinical Disclaimer</h2>
          <p className="text-xs leading-relaxed">
            THE SERVICES, QUIZZES, AND GENERATED REPORTS PROVIDED ON THIS WEBSITE DO NOT CONSTITUTE PSYCHOLOGICAL, PSYCHIATRIC, MEDICAL, OR HEALTHCARE ADVICE, DIAGNOSIS, OR TREATMENT. ALWAYS SEEK THE ADVICE OF A QUALIFIED MENTAL HEALTH PROFESSIONAL OR LICENSED CLINICIAN WITH ANY QUESTIONS REGARDING A MENTAL HEALTH CONDITION.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">3. Purchases & Digital Goods</h2>
          <p>
            Access to the comprehensive 12-page report is provided upon payment of $14.99 USD. Because our product is digital, immediate access is granted via your web browser and email confirmation. All transactions are securely processed by Stripe.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base text-stone-900 mb-2">4. Contact Information</h2>
          <p>
            For any inquiries or dispute resolution, contact our team at {APP_CONFIG.supportEmail}.
          </p>
        </section>
      </div>
    </div>
  );
}
