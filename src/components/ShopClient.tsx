"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductData } from "@/lib/shop-actions";

const CATEGORIES = [
  { slug: "all", label: "All" },
  { slug: "business", label: "Business" },
  { slug: "templates", label: "Templates" },
  { slug: "ebooks", label: "Ebooks" },
  { slug: "tools", label: "Tools" },
];

export default function ShopClient({ products }: { products: ProductData[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, category, query]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="search"
          placeholder="Search digital products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                category === c.slug
                  ? "bg-[#0ea5e9] text-white"
                  : "bg-white border border-[var(--border)] text-slate-600 hover:border-[#0ea5e9]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No products found. Check back soon!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Link
              key={p._id}
              href={`/shop/${p.slug}`}
              className="group bg-white rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-[#0ea5e9]/10 to-[#f59e0b]/10 overflow-hidden relative">
                <img
                  src={
                    p.image ||
                    `https://image.pollinations.ai/prompt/${encodeURIComponent(
                      p.title + ", digital product mockup, professional, Pakistan ecommerce"
                    )}?width=600&height=340&nologo=true&seed=${p._id}`
                  }
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {p.featured && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b] text-white">
                    Featured
                  </span>
                )}
                {p.price <= 0 && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    FREE
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-bold text-[#0f172a] group-hover:text-[#0ea5e9] transition-colors line-clamp-2 mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{p.shortDescription}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {p.price <= 0 ? (
                      <span className="text-lg font-extrabold text-emerald-600">Free</span>
                    ) : (
                      <>
                        <span className="text-lg font-extrabold text-[#0f172a]">
                          Rs. {p.price.toLocaleString()}
                        </span>
                        {p.comparePrice > p.price && (
                          <span className="ml-2 text-sm text-slate-400 line-through">
                            Rs. {p.comparePrice.toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0ea5e9] group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
