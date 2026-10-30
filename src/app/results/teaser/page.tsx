import { Suspense } from "react";
import { TeaserView } from "@/components/TeaserView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Attachment Style Results - Teaser & Shadow Breakdown",
  description: "View your preliminary attachment archetype and unlock your 8-module comprehensive relationship shadow report.",
};

export default function TeaserPage() {
  return (
    <div className="py-6 sm:py-10">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-rose-700 animate-spin" />
          </div>
        }
      >
        <TeaserView />
      </Suspense>
    </div>
  );
}
