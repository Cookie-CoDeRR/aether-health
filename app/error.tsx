"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AETHER Route Error Boundary caught error]:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="max-w-md space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Something went wrong</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          An unexpected application error occurred while rendering this page.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border/70 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
