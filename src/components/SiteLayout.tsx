"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu, X, ChevronDown, Search,
  MessageCircle, Phone, Laptop, Stethoscope, UtensilsCrossed,
  Briefcase, GraduationCap, Shirt, Trophy, Home as HomeIcon, Film,
} from "lucide-react";
import { subscribeAction } from "@/lib/actions";

const CATEGORIES = [
  { name: "Tech", emoji: "💻", slug: "tech", icon: Laptop },
  { name: "Health", emoji: "🏥", slug: "health", icon: Stethoscope },
  { name: "Food", emoji: "🍛", slug: "food", icon: UtensilsCrossed },
  { name: "Business", emoji: "💼", slug: "business", icon: Briefcase },
  { name: "Education", emoji: "📚", slug: "education", icon: GraduationCap },
  { name: "Fashion", emoji: "👗", slug: "fashion", icon: Shirt },
  { name: "Sports", emoji: "🏏", slug: "sports", icon: Trophy },
  { name: "Real Estate", emoji: "🏠", slug: "real-estate", icon: HomeIcon },
  { name: "Jobs", emoji: "💼", slug: "jobs", icon: Briefcase },
  { name: "Entertainment", emoji: "🎬", slug: "entertainment", icon: Film },
];

interface SiteLayoutProps {
  children: React.ReactNode;
  siteLogo?: string;
}

export default function SiteLayout({ children, siteLogo }: SiteLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const nav = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubLoading(true);
    await subscribeAction(email);
    setSubscribed(true);
    setEmail("");
    setSubLoading(false);
    setTimeout(() => setSubscribed(false), 4000);
  };

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Top announcement bar */}
      <div className="bg-[#0f172a] text-white text-xs overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-between gap-2">
          <span className="hidden sm:flex items-center gap-1.5 truncate">🇵🇰 Pakistan&apos;s #1 Digital Resource</span>
          <a
            href="https://wa.me/923000000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-[#f59e0b] transition-colors shrink-0 ml-auto"
          >
            <Phone className="size-3" />
            <span className="hidden xs:inline">Need Help?</span> WhatsApp Us
          </a>
        </div>
      </div>

      {/* Sticky header */}
      <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {siteLogo ? (
              <img src={siteLogo} alt="DigitalDuniya" className="h-12 w-auto object-contain" />
            ) : (
              <span className="font-extrabold text-xl tracking-tight">
                <span className="text-[#0ea5e9]">Digital</span>
                <span className="text-[#0f172a]">Duniya</span>
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {nav.slice(0, 3).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-medium transition-colors hover:text-[#0ea5e9] ${
                  isActive(n.href) ? "text-[#0ea5e9]" : "text-[#1e293b]"
                }`}
              >
                {n.label}
              </Link>
            ))}

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="text-sm font-medium hover:text-[#0ea5e9] flex items-center gap-1 text-[#1e293b] transition-colors">
                Categories <ChevronDown className="size-3.5" />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 pt-2 w-72 z-50">
                  <div className="bg-white border border-[var(--border)] rounded-xl shadow-xl p-3 grid grid-cols-2 gap-1">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/blog?category=${c.slug}`}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-colors"
                      >
                        <span>{c.emoji}</span>
                        <span className="font-medium">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {nav.slice(3).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm font-medium transition-colors hover:text-[#0ea5e9] ${
                  isActive(n.href) ? "text-[#0ea5e9]" : "text-[#1e293b]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/blog" aria-label="Search" className="text-[#0f172a] hover:text-[#0ea5e9] transition-colors">
              <Search className="size-5" />
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-[#f59e0b] text-white text-sm font-semibold hover:bg-[#d97f08] transition-colors shadow-sm"
            >
              Submit Article
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-white">
            <nav className="flex flex-col p-4 gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(n.href)
                      ? "bg-[#e0f2fe] text-[#0ea5e9]"
                      : "hover:bg-gray-50 text-[#1e293b]"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-3 px-3">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/blog?category=${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {c.emoji} {c.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Trust bar */}
      <div className="bg-[#e0f2fe] border-b border-[#bae6fd]">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-xs font-semibold text-[#0c4a6e]">
          <span>✓ Free Tools</span>
          <span>✓ Daily Updated</span>
          <span>✓ Multi-Niche Guides</span>
          <span>✓ Verified Insights</span>
          <span>✓ Google AdSense Partner</span>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="font-extrabold text-2xl text-white mb-3">
              <span className="text-[#0ea5e9]">Digital</span>Duniya
            </div>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Pakistan&apos;s most trusted digital hub for tech trends, business guides, lifestyle tips, and free utility tools.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="hover:text-[#0ea5e9] transition-colors">
                <SocialIcon type="facebook" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-[#0ea5e9] transition-colors">
                <SocialIcon type="twitter" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-[#0ea5e9] transition-colors">
                <SocialIcon type="youtube" />
              </a>
              <a href="#" aria-label="WhatsApp" className="hover:text-[#0ea5e9] transition-colors">
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-[#0ea5e9] transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/privacy" className="hover:text-[#0ea5e9] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0ea5e9] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Categories</h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/blog?category=${c.slug}`} className="hover:text-[#0ea5e9] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-base">Get Weekly Updates</h4>
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
              />
              <button
                type="submit"
                disabled={subLoading}
                className="w-full px-4 py-2.5 rounded-lg bg-[#f59e0b] text-white text-sm font-semibold hover:bg-[#d97f08] transition-colors disabled:opacity-60"
              >
                {subLoading ? "Subscribing..." : "Subscribe"}
              </button>
              {subscribed && (
                <p className="text-xs text-green-400 font-medium">✓ Subscribed! Thank you.</p>
              )}
              <p className="text-xs text-slate-500">Join 5,000+ Pakistani readers. No spam.</p>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} DigitalDuniya — All Rights Reserved</p>
            <p>Made with ❤️ in Pakistan 🇵🇰</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialIcon({ type }: { type: "facebook" | "twitter" | "youtube" }) {
  const paths = {
    facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    twitter: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
    youtube: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z",
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d={paths[type]} />
    </svg>
  );
}
