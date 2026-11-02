import Link from "next/link";
import { ShieldCheck, HeartHandshake } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100 text-stone-600 text-sm mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 font-serif text-lg font-bold text-stone-900 mb-3">
              <HeartHandshake className="w-5 h-5 text-rose-700" />
              <span>Attachment & Shadow Lab</span>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed">
              Evidence-based psychological profiling and relational shadow mapping inspired by modern ECR-R psychometrics and Attachment Theory.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              14-Day Money-Back Guarantee
            </h4>
            <p className="text-stone-500 text-xs leading-relaxed">
              We offer a 100% hassle-free 14-day refund guarantee. If you are not satisfied with your comprehensive assessment report, contact {APP_CONFIG.supportEmail} for an immediate full refund.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-900 mb-3">Support &amp; Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/restore" className="font-semibold text-rose-800 hover:text-rose-950 hover:underline">
                  Restore Purchased Report
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-stone-900 hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-stone-900 hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-stone-900 hover:underline">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Medical Disclaimer Banner */}
        <div className="border-t border-stone-200 pt-6 mt-6">
          <p className="text-[11px] leading-relaxed text-stone-400 text-center max-w-4xl mx-auto">
            <strong>Mandatory Medical & Clinical Disclaimer:</strong> This assessment and all generated shadow reports are provided strictly for educational, informational, and self-reflection purposes. It does not constitute medical, psychiatric, or psychological diagnosis, treatment, or psychotherapy. If you are experiencing severe emotional distress or relationship crisis, please consult a licensed mental health professional.
          </p>
          <p className="text-center text-xs text-stone-400 mt-4">
            &copy; {new Date().getFullYear()} Attachment & Shadow Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
