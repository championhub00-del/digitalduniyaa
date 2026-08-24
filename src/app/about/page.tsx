import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About DigitalDuniya — Pakistan's Premium Niche & Utility Hub",
  description:
    "Learn about DigitalDuniya — Pakistan's premium portal for tech reviews, business ideas, lifestyle tips, and free utility tools.",
  path: "/about",
  keywords: [
    "about DigitalDuniya",
    "Pakistan tech resource",
    "Pakistan business guide",
    "Pakistani blog",
    "digital Pakistan portal",
    "utility tools Pakistan",
  ],
});

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold uppercase tracking-wider mb-4">
          Our Story
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-4">About DigitalDuniya</h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Pakistan&apos;s most trusted digital resource for tech trends, business guides, and free utility tools.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-14">
        {[
          { emoji: "🛠️", title: "Utility Tools", desc: "Free, real-time calculators including our courier rates estimator to simplify daily operations." },
          { emoji: "📝", title: "Multi-Niche Content", desc: "Practical tech, business, education, health, and lifestyle articles written specifically for Pakistan." },
          { emoji: "💡", title: "Daily Value", desc: "Helping you learn, grow, and make informed decisions — whether buying tech or starting a venture." },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{item.emoji}</div>
            <h3 className="font-bold text-[#0f172a] mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-8 md:p-10 shadow-sm space-y-6 text-base leading-relaxed text-slate-600">
        <p>
          <strong className="text-[#0f172a]">DigitalDuniya</strong> was built to bridge the gap between information and action for Pakistani internet users. We noticed that while there were many blogs, there was no single reliable source combining high-quality, practical guides with free utility tools (like our shipping calculator) tailored specifically to Pakistan&apos;s context.
        </p>
        <p>
          So we built it. We cover everything that matters to the modern Pakistani reader: tech reviews, educational updates, lifestyle tips, business strategies, and practical tools to calculate shipping rates, track parcel costs, and optimize daily operations.
        </p>

        <div className="border-l-4 border-[#0ea5e9] pl-5 py-2 my-4 bg-[#f0f9ff] rounded-r-xl">
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">Our Mission</h2>
          <p>
            To empower Pakistani readers and creators with actionable insights, high-quality resources, and free digital tools to simplify their personal and professional lives.
          </p>
        </div>

        <p>
          We believe in providing <strong className="text-[#0f172a]">free, accurate, and actionable</strong> information. All our tools are free to use. All our articles are written with real research. We are supported by Google AdSense advertising, not by paid content or hidden promotions.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {[
            { label: "Founded", value: "2025" },
            { label: "Categories Covered", value: "10+" },
            { label: "Monthly Readers", value: "5,000+" },
            { label: "Articles Published", value: "50+" },
          ].map((s) => (
            <div key={s.label} className="bg-[#f8fafc] rounded-xl p-4 flex justify-between items-center border border-[var(--border)]">
              <span className="text-sm text-slate-500 font-medium">{s.label}</span>
              <span className="font-bold text-[#0ea5e9] text-lg">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
