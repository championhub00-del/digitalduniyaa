import { getBlogsAction, getSettingsAction } from "@/lib/actions";
import AdSlot from "@/components/AdSlot";
import BlogListClient from "@/components/BlogListClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Blog — Pakistan Ecommerce, Tech & Lifestyle Guides",
  description:
    "Read the latest guides on Pakistani courier services, ecommerce tips, tech reviews, health, food, fashion, sports, and more. Updated daily for Pakistani readers.",
  path: "/blog",
  keywords: [
    "Pakistan ecommerce blog",
    "courier guide Pakistan",
    "tech blog Pakistan",
    "online business Pakistan",
    "lifestyle Pakistan",
    "shipping guide Pakistan",
    "DigitalDuniya blog",
  ],
});

export default async function BlogPage() {
  let blogs: Awaited<ReturnType<typeof getBlogsAction>> = [];
  let settings = { siteLogo: "", adsenseId: "", groqKey: "", geminiKey: "", youtubeKey: "" };
  try {
    [blogs, settings] = await Promise.all([getBlogsAction(), getSettingsAction()]);
  } catch {
    // Continue with empty list if database is unavailable
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">
          DigitalDuniya Blog
        </h1>
        <p className="text-slate-500 text-base sm:text-lg">
          Ecommerce, shipping, tech, health &amp; lifestyle for Pakistan.
        </p>
      </header>
      <AdSlot size="728x90" label="Blog Header Ad" adsenseId={settings.adsenseId} />
      <BlogListClient blogs={JSON.parse(JSON.stringify(blogs))} adsenseId={settings.adsenseId} />
    </div>
  );
}
