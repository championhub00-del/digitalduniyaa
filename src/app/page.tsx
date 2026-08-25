import Link from "next/link";
import { getBlogsAction, getSettingsAction, seedBlogsIfEmpty } from "@/lib/actions";
import AdSlot from "@/components/AdSlot";
import HomeClient from "@/components/HomeClient";
import {
  Laptop, Stethoscope, UtensilsCrossed, Briefcase,
  GraduationCap, Shirt, Trophy, Home as HomeIcon, Film, ArrowRight,
  LayoutGrid, BookOpen, Sparkles, Users,
  ShieldCheck, CheckCircle2, Clock, Calculator, Calendar, HelpCircle,
  FileImage, Search
} from "lucide-react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "DigitalDuniya — Pakistan's Premium Tech, Business, Life & Utility Portal",
  description:
    "Explore modern guides on technology, business ideas, health, lifestyle, and education. Use our free real-time shipping calculator to compare rates instantly.",
  path: "/",
});

const CATEGORIES = [
  { name: "Tech", slug: "tech", icon: Laptop, color: "bg-sky-100 text-sky-600" },
  { name: "Health", slug: "health", icon: Stethoscope, color: "bg-rose-100 text-rose-600" },
  { name: "Food", slug: "food", icon: UtensilsCrossed, color: "bg-amber-100 text-amber-600" },
  { name: "Business", slug: "business", icon: Briefcase, color: "bg-emerald-100 text-emerald-600" },
  { name: "Education", slug: "education", icon: GraduationCap, color: "bg-indigo-100 text-indigo-600" },
  { name: "Fashion", slug: "fashion", icon: Shirt, color: "bg-pink-100 text-pink-600" },
  { name: "Sports", slug: "sports", icon: Trophy, color: "bg-orange-100 text-orange-600" },
  { name: "Real Estate", slug: "real-estate", icon: HomeIcon, color: "bg-teal-100 text-teal-600" },
  { name: "Jobs", slug: "jobs", icon: Briefcase, color: "bg-violet-100 text-violet-600" },
  { name: "Entertainment", slug: "entertainment", icon: Film, color: "bg-fuchsia-100 text-fuchsia-600" },
];

const TICKER_ITEMS = [
  "💻 Tech: Top 5 budget smartphones in Pakistan for 2026",
  "📦 TCS announces updated shipping rates for 2026",
  "🎓 Education: Board exams registration schedule announced",
  "🚀 Business: 10 profitable online business ideas in Pakistan",
  "🏏 Sports: Pakistan cricket matches & schedule released",
  "💰 Finance: Freelancer tax registration guides updated",
  "🚚 Leopard Courier expands cash-on-delivery services",
];

export default async function HomePage() {
  let blogs: Awaited<ReturnType<typeof getBlogsAction>> = [];
  let settings = { siteLogo: "", adsenseId: "", groqKey: "", geminiKey: "", youtubeKey: "" };

  try {
    await seedBlogsIfEmpty();
    [blogs, settings] = await Promise.all([getBlogsAction(), getSettingsAction()]);
  } catch {
    // Continue with empty blogs if database is unavailable
  }

  // Use the first blog post as the Hero Featured Banner, list next 6 in the grid below
  const featuredPost = blogs[0];
  const gridPosts = blogs.slice(1, 7);

  return (
    <div>
      {/* News ticker */}
      <div className="bg-[#0f172a] text-white overflow-hidden border-b border-[#1e293b]">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="shrink-0 bg-[#f59e0b] text-[#0f172a] text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
            Breaking
          </span>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-16 whitespace-nowrap" style={{ animation: "ticker 30s linear infinite" }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} className="text-sm text-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Full-Width Hero Banner */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-14 sm:py-20 border-b border-slate-800 relative overflow-hidden">
        {/* Aesthetic background details */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left: Typography & Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#0ea5e9] text-xs font-bold uppercase tracking-wider border border-white/5">
              🇵🇰 Pakistan&apos;s Premium Utility &amp; Resource Hub
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white">
              Empowering E-Commerce, <span className="text-[#0ea5e9]">Tech</span> &amp; Digital Creators
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Compare local shipping rates for Leopards, TCS, M&amp;P, and BlueEx instantly. Optimize and compress your images client-side for faster web speeds. Access expert-written guides on freelancing, tech, and digital business.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/calculator"
                className="px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97f08] text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center gap-2"
              >
                <Calculator className="size-4" /> Open Courier Calculator
              </Link>
              <Link
                href="/compressor"
                className="px-6 py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 text-sm flex items-center gap-2"
              >
                <FileImage className="size-4" /> Compress Images (WebP) ⚡
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">✓ 100% Free Tools</span>
              <span className="flex items-center gap-1.5">✓ No Logins Required</span>
              <span className="flex items-center gap-1.5">✓ 100% Private &amp; Secure</span>
            </div>
          </div>

          {/* Right: Premium Workspace Graphic Collage */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-video sm:aspect-square flex items-center justify-center">
              {/* Main Laptop Image */}
              <div className="w-[85%] aspect-video sm:aspect-[4/3] rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-2xl overflow-hidden relative z-10 transition-transform hover:scale-[1.01] duration-300">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                  alt="Tech Workstation"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <Sparkles className="size-3 text-[#0ea5e9]" /> Digital Tools Suite
                  </span>
                </div>
              </div>

              {/* Overlay Packages Image representing shipping */}
              <div className="absolute -bottom-4 -left-2 w-44 h-32 rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-xl overflow-hidden z-20 hidden sm:block hover:translate-y-[-4px] transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"
                  alt="E-commerce Shipping Box"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Small abstract accent */}
              <div className="absolute -top-6 right-6 size-12 rounded-xl bg-gradient-to-tr from-[#f59e0b] to-[#0ea5e9] opacity-20 blur-md animate-pulse pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: Articles ── */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0f172a] mb-1">
                Featured Guides &amp; Tech Reviews
              </h2>
              <p className="text-slate-500 text-sm">Expertly written articles and resources for digital growth</p>
            </div>

            {/* Featured Post Card */}
            {featuredPost ? (
              <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                <Link href={`/blog/${featuredPost.slug}`} className="flex flex-col md:grid md:grid-cols-12">
                  <div className="md:col-span-7 aspect-video md:aspect-auto md:h-64 overflow-hidden bg-gradient-to-br from-[#0ea5e9]/20 to-[#f59e0b]/20 relative">
                    <img
                      src={
                        featuredPost.image ||
                        `https://image.pollinations.ai/prompt/${encodeURIComponent(
                          featuredPost.title + ", realistic DSLR photography, editorial illustration style, pakistani digital workspace, premium lighting"
                        )}?width=800&height=450&nologo=true&seed=${String(featuredPost._id)}`
                      }
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      {featuredPost.tags.slice(0, 2).map((t: string) => (
                        <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 font-extrabold shadow-sm border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-5 p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#f59e0b] uppercase tracking-wider block mb-2">
                        🔥 Featured Post
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug group-hover:text-[#0ea5e9] transition-colors line-clamp-3">
                        {featuredPost.title}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mt-2.5">
                        {featuredPost.metaDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-5 pt-3 border-t border-slate-50">
                      <span>{new Date(featuredPost.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric", month: "short", day: "numeric",
                      })}</span>
                      <span className="text-[#0ea5e9] font-bold group-hover:underline">Read Article →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center text-slate-400 border border-slate-200/50">
                Welcome to DigitalDuniya. Seed blogs in the Admin panel to start viewing articles.
              </div>
            )}

            {/* Articles Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 text-lg">Latest Publications</h3>
                <Link href="/blog" className="text-[#0ea5e9] text-xs font-bold hover:underline flex items-center gap-1">
                  View All <ArrowRight className="size-3" />
                </Link>
              </div>

              {gridPosts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {gridPosts.map((b) => (
                    <Link
                      key={String(b._id)}
                      href={`/blog/${b.slug}`}
                      className="group block rounded-2xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#0ea5e9]/20 to-[#f59e0b]/20 overflow-hidden relative">
                        <img
                          src={
                            b.image ||
                            `https://image.pollinations.ai/prompt/${encodeURIComponent(
                              b.title + ", professional DSLR photography, realistic, studio lighting"
                            )}?width=600&height=340&nologo=true&seed=${String(b._id)}`
                          }
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          {b.tags.slice(0, 1).map((t: string) => (
                            <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/90 text-slate-800 font-extrabold shadow-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-slate-800 group-hover:text-[#0ea5e9] transition-colors line-clamp-2 leading-snug text-sm sm:text-base">
                          {b.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">{b.metaDescription}</p>
                        <div className="mt-4 text-[10px] text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString("en-PK", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Top 10 High-Income Digital Skills to Learn in Pakistan for 2026",
                      desc: "Discover the most in-demand technical and business skills you can learn today to start earning in USD from Pakistan.",
                      tag: "Business",
                      imageSeed: "1"
                    },
                    {
                      title: "How to Secure an FBR Tax Registration Certificate as a Freelancer",
                      desc: "A step-by-step walkthrough detailing how Pakistani freelancers can register with FBR and pay a reduced tax rate.",
                      tag: "Finance",
                      imageSeed: "2"
                    }
                  ].map((mock, idx) => (
                    <div key={idx} className="group block rounded-2xl border border-[var(--border)] bg-white overflow-hidden hover:shadow-md transition-all duration-300">
                      <div className="aspect-video bg-gradient-to-br from-[#0ea5e9]/20 to-[#f59e0b]/20 overflow-hidden relative">
                        <img
                          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(mock.title + ", realistic DSLR photography, professional layout")}?width=600&height=340&nologo=true&seed=${mock.imageSeed}`}
                          alt={mock.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/90 text-slate-800 font-extrabold shadow-sm">
                            {mock.tag}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-slate-800 leading-snug text-sm sm:text-base">
                          {mock.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-2">{mock.desc}</p>
                        <div className="mt-4 text-[10px] text-slate-400">
                          June 23, 2026
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Sidebar Widgets ── */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Courier Calculator Widget */}
            <div className="bg-white rounded-3xl border border-[var(--border)] p-6 shadow-sm">
              <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100">
                <Calculator className="size-4 text-[#f59e0b]" /> Quick Courier Estimator
              </h3>
              <HomeClient />
            </div>

            {/* Image Compressor Callout Widget */}
            <div className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="font-bold text-base mb-2 flex items-center gap-1.5">
                <FileImage className="size-4.5" /> WebP Image Optimizer
              </h3>
              <p className="text-xs opacity-90 leading-relaxed mb-5">
                Optimize image loading speeds instantly. Convert large JPGs/PNGs to WebP without losing quality. Fully private inside your browser.
              </p>
              <Link
                href="/compressor"
                className="inline-block text-center w-full px-4 py-2.5 bg-[#f59e0b] hover:bg-[#d97f08] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Optimize Images Now
              </Link>
            </div>

            {/* AdSlot in Sidebar */}
            <AdSlot size="300x250" label="Sidebar Banner Ad" adsenseId={settings.adsenseId} />

            {/* Quick Categories Navigation */}
            <div className="bg-white rounded-3xl border border-[var(--border)] p-6 shadow-sm">
              <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100">
                <LayoutGrid className="size-4 text-[#0ea5e9]" /> Browse Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/blog?category=${c.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[#f0f9ff] text-slate-700 hover:text-[#0ea5e9] font-medium border border-slate-100 hover:border-sky-100 transition-all"
                  >
                    <span>{c.name === "Tech" ? "💻" : c.name === "Health" ? "🩺" : c.name === "Food" ? "🍲" : c.name === "Business" ? "💼" : c.name === "Education" ? "🎓" : c.name === "Fashion" ? "👕" : c.name === "Sports" ? "🏏" : c.name === "Real Estate" ? "🏠" : c.name === "Jobs" ? "👔" : "🎬"}</span>
                    <span className="truncate">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Middle Banner Ad */}
      <div className="max-w-6xl mx-auto px-4 my-2">
        <AdSlot size="728x90" label="Middle Banner Ad" adsenseId={settings.adsenseId} />
      </div>

      {/* Utilities Directory Section */}
      <section className="bg-slate-50 py-14 border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-2">
              Free Digital Utilities Suite
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">Real-time tools designed to make online work easier in Pakistan</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[
              {
                title: "Shipping Calculator",
                desc: "Compare TCS, Leopard, M&P, and BlueEx rates across 90+ Pakistani cities instantly. Includes COD fees.",
                action: "Calculate Rates",
                link: "/calculator",
                badge: "Active",
                badgeColor: "bg-emerald-100 text-emerald-700",
                icon: Calculator
              },
              {
                title: "AI BG Remover",
                desc: "Remove image backgrounds locally in HD quality. Touch up details with our precision eraser brush.",
                action: "Remove BG",
                link: "/background-remover",
                badge: "AI Powered",
                badgeColor: "bg-sky-100 text-sky-700",
                icon: Sparkles
              },
              {
                title: "AI Image Upscaler",
                desc: "Increase photo dimensions and enhance resolution instantly for free. 100% private in-browser upscaling.",
                action: "Upscale Image",
                link: "/image-upscaler",
                badge: "AI Powered",
                badgeColor: "bg-sky-100 text-sky-700",
                icon: Laptop
              },
              {
                title: "Premium PDF Editor",
                desc: "Merge, split, rotate, watermark PDFs, or place custom text and image overlays locally.",
                action: "Edit PDF Files",
                link: "/pdf-tools",
                badge: "Active",
                badgeColor: "bg-emerald-100 text-emerald-700",
                icon: FileImage
              },
              {
                title: "Image Compressor",
                desc: "Compress, resize, and convert JPEG, PNG, and WebP images. Boost web load speed instantly.",
                action: "Compress Image",
                link: "/compressor",
                badge: "Active",
                badgeColor: "bg-emerald-100 text-emerald-700",
                icon: FileImage
              }
            ].map((tool, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm flex flex-col justify-between group hover:border-[#0ea5e9] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                    <tool.icon className="size-4.5 text-slate-400 group-hover:text-[#0ea5e9] transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-[#0ea5e9] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed mb-6">{tool.desc}</p>
                </div>
                {tool.link !== "#" ? (
                  <Link
                    href={tool.link}
                    className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#0ea5e9] text-white text-xs font-bold hover:bg-[#0284c7] transition-all"
                  >
                    {tool.action}
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center"
                  >
                    {tool.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EEAT Trust Section */}
      <section className="bg-white border-b border-[var(--border)] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-2">
              Why Millions Trust DigitalDuniya
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">Our core publishing standards and editorial values</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Fact-Checked Guides",
                desc: "Every article is researched and fact-checked by digital professionals before release.",
                color: "text-emerald-500 bg-emerald-50"
              },
              {
                icon: CheckCircle2,
                title: "100% Free Tools",
                desc: "No paywalls or premium logins. All estimators, calculators, and files are free for everyone.",
                color: "text-[#0ea5e9] bg-sky-50"
              },
              {
                icon: Clock,
                title: "Daily Updated Data",
                desc: "We verify and update shipping rates, courier city lists, and policies daily.",
                color: "text-amber-500 bg-amber-50"
              },
              {
                icon: Users,
                title: "Community First",
                desc: "Built specifically to solve real challenges faced by Pakistani sellers and creators.",
                color: "text-rose-500 bg-rose-50"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${t.color}`}>
                  <t.icon className="size-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{t.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatDark icon={<LayoutGrid className="size-6" />} value="10+" label="Categories" />
          <StatDark icon={<BookOpen className="size-6" />} value="50+" label="Guides" />
          <StatDark icon={<Sparkles className="size-6" />} value="Daily" label="Updates" />
          <StatDark icon={<Users className="size-6" />} value="5K+" label="Readers" />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Try Our Free Utility &amp; Calculator Tools
          </h2>
          <p className="opacity-90 mb-7 text-lg">
            Compare courier rates instantly for Leopard, TCS, M&amp;P, and BlueEx using our live, data-backed shipping cost estimator.
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#f59e0b] text-white font-bold text-lg hover:bg-[#d97f08] transition-colors shadow-lg"
          >
            Open Shipping Calculator <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatDark({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[#0ea5e9] mb-3 size-14 rounded-full bg-white/10 grid place-items-center">
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

