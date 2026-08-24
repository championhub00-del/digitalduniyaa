"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package } from "lucide-react";
import AdSlot from "@/components/AdSlot";

interface Blog {
  _id: string;
  slug: string;
  title: string;
  metaDescription: string;
  tags: string[];
  image: string;
  createdAt: string;
}

interface Props {
  blogs: Blog[];
  adsenseId?: string;
}

export default function BlogListClient({ blogs, adsenseId }: Props) {
  const [q, setQ] = useState("");

  const filtered = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-8 max-w-lg mt-6">
        <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="blog-search"
          aria-label="Search articles"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles, topics, tags..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors shadow-sm"
        />
      </div>

      {/* Blog grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filtered.flatMap((b, i) => {
          const articleEl = (
            <article
              key={b._id}
              className="rounded-xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <Link href={`/blog/${b.slug}`} className="flex flex-col flex-1">
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-[#0ea5e9]/20 to-[#f59e0b]/20 overflow-hidden">
                  <img
                    src={
                      b.image ||
                      `https://image.pollinations.ai/prompt/${encodeURIComponent(
                        b.title + ", professional DSLR photography, realistic, high resolution, detailed, studio lighting"
                      )}?width=600&height=340&nologo=true&seed=${b._id}`
                    }
                    alt={b.title}
                    width={600}
                    height={340}
                    loading={i < 6 ? "eager" : "lazy"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card body */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="text-xs text-slate-400 mb-2">
                    {new Date(b.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {b.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0c4a6e] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="font-bold text-[#0f172a] mb-2 line-clamp-2 leading-snug group-hover:text-[#0ea5e9] transition-colors text-base sm:text-[15px]">
                    {b.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
                    {b.metaDescription}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0ea5e9]">
                    Read more →
                  </div>
                </div>
              </Link>
            </article>
          );

          if ((i + 1) % 6 === 0) {
            return [
              articleEl,
              <div key={`ad-${b._id}`} className="sm:col-span-2 lg:col-span-3">
                <AdSlot size="728x90" label="In-List Ad" adsenseId={adsenseId} />
              </div>
            ];
          }
          return [articleEl];
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-slate-400">
            <Package className="size-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No articles found for &ldquo;{q}&rdquo;</p>
            <p className="text-sm mt-1">Try a different keyword or browse all articles.</p>
          </div>
        )}
      </div>
    </>
  );
}
