"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen items-center justify-center bg-slate-900 text-slate-100 p-6 font-sans">
        <div className="max-w-md text-center space-y-4 rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            ⚠️
          </div>
          <h1 className="text-xl font-bold">Critical Application Error</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            A critical system error occurred. Please refresh or click below to recover.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
          >
            Reload AETHER App
          </button>
        </div>
      </body>
    </html>
  );
}
