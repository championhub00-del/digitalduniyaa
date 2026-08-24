"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (will be visible in Vercel Function logs)
    console.error("Admin Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-red-100 rounded-2xl p-7 shadow-sm text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          An error occurred while rendering the admin control panel.
        </p>
        
        <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 font-mono text-xs text-slate-600 max-h-48 overflow-auto break-all">
          <span className="font-bold text-red-600">Error:</span> {error.message || "Unknown Error"}
          {error.digest && (
            <div className="mt-2 text-[10px] text-slate-400">
              Digest: {error.digest}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-center text-sm flex items-center justify-center"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
