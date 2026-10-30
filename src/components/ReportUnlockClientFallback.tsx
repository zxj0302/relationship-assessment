"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ReportUnlockClientFallbackProps {
  resultId: string;
}

export function ReportUnlockClientFallback({ resultId }: ReportUnlockClientFallbackProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const url = new URL(window.location.href);
      const storageKey = `unlocked_report_token_${resultId}`;

      // If URL already contains a token, the server already evaluated and rejected it.
      // Clear any invalid/stale saved token and do not loop redirect.
      if (url.searchParams.has("token")) {
        localStorage.removeItem(storageKey);
        return;
      }

      const savedToken = localStorage.getItem(storageKey);

      if (savedToken && savedToken.trim().length > 0) {
        setIsRestoring(true);
        url.searchParams.set("token", savedToken.trim());
        window.location.replace(url.toString());
      }
    } catch {
      // Storage access or URL parsing failed, gracefully ignore
    }
  }, [resultId]);

  if (!isRestoring) {
    return null;
  }

  return (
    <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center gap-2 text-rose-800 text-xs font-medium animate-pulse shadow-sm">
      <Loader2 className="w-4 h-4 animate-spin text-rose-600 shrink-0" />
      <span>Found saved report credentials. Restoring your unlocked report...</span>
    </div>
  );
}
