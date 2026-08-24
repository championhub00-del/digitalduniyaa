import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogAction, getBlogsAction, getSettingsAction, getCommentsAction } from "@/lib/actions";
import AdSlot from "@/components/AdSlot";
import BlogPostClient from "@/components/BlogPostClient";
import CommentSection from "@/components/CommentSection";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";
import { blogPostingJsonLd, breadcrumbJsonLd, pageMetadata, SITE_NAME } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const blogs = await getBlogsAction();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

// Estimated reading time helper
function readingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogAction(slug);
  if (!blog) return { title: "Article Not Found", robots: { index: false, follow: false } };

  const ogImage = blog.image ||
    `https://image.pollinations.ai/prompt/${encodeURIComponent(
      blog.title + ", professional DSLR photography, realistic, high resolution, Pakistan"
    )}?width=1200&height=630&nologo=true&seed=${String(blog._id)}`;

  return pageMetadata({
    title: blog.title,
    description: blog.metaDescription,
    path: `/blog/${slug}`,
    image: ogImage,
    type: "article",
    keywords: blog.tags,
    tags: blog.tags,
    publishedTime: new Date(blog.createdAt).toISOString(),
    modifiedTime: new Date(blog.updatedAt || blog.createdAt).toISOString(),
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [blog, allBlogs, settings] = await Promise.all([
    getBlogAction(slug),
    getBlogsAction(),
    getSettingsAction(),
  ]);

  if (!blog) notFound();

  const blogComments = await getCommentsAction(String(blog._id));
  const related = allBlogs.filter((b) => b.slug !== slug).slice(0, 4);
  const mins = readingTime(blog.content);

  // Build table of contents from H2 headings
  const toc: { text: string; id: string }[] = [];
  const h2Matches = [...blog.content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
  for (const m of h2Matches) {
    const text = m[1].replace(/<[^>]+>/g, "");
    toc.push({ text, id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
  }

  const structuredData = blogPostingJsonLd({
    slug,
    title: blog.title,
    metaDescription: blog.metaDescription,
    image: blog.image,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    tags: blog.tags,
  });

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: blog.title, path: `/blog/${slug}` },
  ]);

  const featuredImage =
    blog.image ||
    `https://image.pollinations.ai/prompt/${encodeURIComponent(
      blog.title + ", professional DSLR photography, realistic, high resolution, detailed, studio lighting"
    )}?width=1200&height=630&nologo=true&seed=${String(blog._id)}`;

  return (
    <>
      <JsonLd data={[structuredData, breadcrumbs]} />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#0ea5e9] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#0ea5e9] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-600 line-clamp-1">{blog.title}</span>
        </nav>

        <AdSlot size="728x90" label="Article Header Ad" adsenseId={settings.adsenseId} />

        {/* Main layout: article + sidebar. Sidebar only appears on XL screens */}
        <div className="mt-6 grid xl:grid-cols-[1fr_300px] gap-8">

          {/* ── Main Article ── */}
          <div className="min-w-0">
            <article className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">

              {/* Featured image — full bleed */}
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={featuredImage}
                  alt={blog.title}
                  width={1200}
                  height={630}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Tags */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {blog.tags.map((t: string) => (
                    <Link
                      key={t}
                      href={`/blog?category=${t.toLowerCase()}`}
                      className="text-xs px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0c4a6e] font-semibold hover:bg-[#bae6fd] transition-colors"
                    >
                      {t}
                    </Link>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-4 leading-tight">
                  {blog.title}
                </h1>

                {/* Meta bar */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400 mb-6 pb-6 border-b border-[var(--border)]">
                  <span>
                    📅{" "}
                    {new Date(blog.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>✍️ {SITE_NAME}</span>
                  <span>⏱️ {mins} min read</span>
                  <span>💬 {blogComments.length} comments</span>
                </div>

                {/* Table of Contents */}
                {toc.length > 0 && (
                  <nav aria-label="Table of contents" className="mb-8 border border-[#bae6fd] rounded-xl bg-[#f0f9ff] p-4 sm:p-5">
                    <div className="text-sm font-bold mb-3 text-[#0f172a] flex items-center gap-2">
                      📋 Table of Contents
                    </div>
                    <ol className="space-y-1.5">
                      {toc.map((t, i) => (
                        <li key={t.id} className="flex items-start gap-2 text-sm">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-[#0ea5e9] text-white text-xs grid place-items-center font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <a href={`#${t.id}`} className="text-[#0ea5e9] hover:underline leading-snug">
                            {t.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                {/* Blog content */}
                <BlogPostClient content={blog.content} adsenseId={settings.adsenseId} />
              </div>
            </article>

            {/* ── Mobile sidebar (shown below article on small screens) ── */}
            <div className="xl:hidden mt-6 space-y-6">
              <MobileSidebar related={related} />
              <AdSlot size="300x250" label="Mobile Sidebar Ad" adsenseId={settings.adsenseId} />
            </div>

            {/* Comments section */}
            <div className="mt-8">
              <CommentSection
                blogId={String(blog._id)}
                initialComments={JSON.parse(JSON.stringify(blogComments))}
              />
            </div>
          </div>

          {/* ── Desktop Sidebar — only on XL ── */}
          <aside className="hidden xl:flex flex-col gap-6">
            <AdSlot size="300x250" label="Sidebar Ad" adsenseId={settings.adsenseId} />

            {/* Related posts */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
              <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
                📚 Related Posts
              </h3>
              <ul className="space-y-4">
                {related.map((r) => (
                  <li key={String(r._id)}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="flex gap-3 hover:text-[#0ea5e9] transition-colors group"
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-[#e0f2fe]">
                        <img
                          src={
                            r.image ||
                            `https://image.pollinations.ai/prompt/${encodeURIComponent(r.title + ", Pakistan")}?width=120&height=80&nologo=true&seed=${String(r._id)}`
                          }
                          alt={r.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="text-sm font-medium text-[#1e293b] group-hover:text-[#0ea5e9] leading-snug line-clamp-3">
                        {r.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calculator CTA */}
            <div className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white rounded-2xl p-5 shadow-lg">
              <div className="text-2xl mb-2">🧮</div>
              <h3 className="font-bold text-lg mb-2">Free Shipping Calculator</h3>
              <p className="text-sm opacity-90 mb-4 leading-relaxed">
                Get instant rates for Leopard, TCS, M&amp;P, and BlueEx.
              </p>
              <Link
                href="/calculator"
                className="inline-block w-full text-center px-4 py-2.5 bg-[#f59e0b] text-white rounded-xl text-sm font-bold hover:bg-[#d97f08] transition-colors"
              >
                Calculate Now →
              </Link>
            </div>

            <AdSlot size="300x250" label="Sidebar Ad 2" adsenseId={settings.adsenseId} />
          </aside>
        </div>
      </div>
    </>
  );
}

// Mobile-only related posts component
function MobileSidebar({
  related,
}: {
  related: { _id: unknown; slug: string; title: string; image?: string }[];
}) {
  if (!related.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
      <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
        📚 Related Posts
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {related.slice(0, 4).map((r) => (
          <Link
            key={String(r._id)}
            href={`/blog/${r.slug}`}
            className="group flex flex-col gap-2"
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-[#e0f2fe]">
              <img
                src={
                  r.image ||
                  `https://image.pollinations.ai/prompt/${encodeURIComponent(r.title + ", Pakistan")}?width=300&height=170&nologo=true&seed=${String(r._id)}`
                }
                alt={r.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-medium text-[#1e293b] group-hover:text-[#0ea5e9] transition-colors leading-snug line-clamp-2">
              {r.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
