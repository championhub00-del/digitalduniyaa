"use client";

import { useEffect } from "react";

interface AdSlotProps {
  size: "728x90" | "300x250" | "336x280" | "320x100";
  label?: string;
  adsenseId?: string;
}

export default function AdSlot({ size, label = "Advertisement", adsenseId }: AdSlotProps) {
  // If it's a desktop leaderboard, we split it into desktop (728x90) and mobile (320x100 or 300x250)
  if (size === "728x90") {
    return (
      <div className="mx-auto my-6 w-full flex justify-center overflow-hidden">
        {/* Desktop Leaderboard */}
        <div className="hidden sm:block">
          <AdUnit size="728x90" label={label} adsenseId={adsenseId} />
        </div>
        {/* Mobile Banner */}
        <div className="block sm:hidden">
          <AdUnit size="320x100" label={`${label} (Mobile)`} adsenseId={adsenseId} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-6 w-full flex justify-center overflow-hidden">
      <AdUnit size={size} label={label} adsenseId={adsenseId} />
    </div>
  );
}

function AdUnit({ size, label, adsenseId }: { size: "728x90" | "300x250" | "336x280" | "320x100"; label: string; adsenseId?: string }) {
  const [w, h] = size.split("x").map(Number);
  const seed = `${size}-${label.replace(/\s+/g, "-")}`;
  const bgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `Pakistan digital blog banner, ${label}, modern flat illustration, sky blue amber palette, professional`
  )}?width=${w}&height=${h}&nologo=true&seed=${encodeURIComponent(seed)}`;

  useEffect(() => {
    if (adsenseId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.warn("AdSense push error (usually safe to ignore in development):", err);
      }
    }
  }, [adsenseId]);

  if (adsenseId) {
    return (
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: w, height: h, maxWidth: "100%" }}
        data-ad-client={adsenseId}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--border)] shadow-sm"
      style={{
        width: w,
        height: h,
        maxWidth: "100%",
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      data-ad-slot={size}
      aria-label={label}
    >
      <span className="absolute bottom-2 right-2 text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full">
        Ad · {size}
      </span>
    </div>
  );
}
