"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const hideTakeTestCta =
    pathname?.startsWith("/quiz") ||
    pathname?.startsWith("/results") ||
    pathname?.startsWith("/report");

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-stone-50/90 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between sm:px-6">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 transition group-hover:scale-105">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight">
            Attachment <span className="text-rose-800">&</span> Shadow Lab
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
            <span>Confidential & Anonymous</span>
          </div>

          {!hideTakeTestCta && (
            <Link
              href="/quiz"
              className="text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full transition shadow-sm active:scale-95"
            >
              Take Test
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
