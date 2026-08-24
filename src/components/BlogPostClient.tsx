"use client";

import { useEffect, useRef } from "react";
import AdSlot from "@/components/AdSlot";

interface Props {
  content: string;
  adsenseId?: string;
}

export default function BlogPostClient({ content, adsenseId }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Add IDs to all h2 elements for TOC anchor links
  useEffect(() => {
    if (!ref.current) return;
    ref.current.querySelectorAll("h2").forEach((el) => {
      const text = el.textContent || "";
      el.id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      el.className = "scroll-mt-24";
    });
  }, [content]);

  // Split content for mid-article ad
  const mid = Math.floor(content.length / 2);
  const splitPoint = content.indexOf("</p>", mid);
  const firstHalf = splitPoint > -1 ? content.slice(0, splitPoint + 4) : content;
  const secondHalf = splitPoint > -1 ? content.slice(splitPoint + 4) : "";

  return (
    <div className="blog-content" ref={ref}>
      <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
      {secondHalf && (
        <>
          <AdSlot size="336x280" label="In-Content Ad" adsenseId={adsenseId} />
          <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
        </>
      )}
    </div>
  );
}
