"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function PaymentStatusRefreshButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isLoading}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-75 text-white font-semibold px-6 py-3.5 rounded-xl shadow transition cursor-pointer"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>{isLoading ? "Checking Status..." : "Check Payment Status"}</span>
    </button>
  );
}
