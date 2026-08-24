"use server";

import { connectToDatabase } from "./db";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import Settings from "@/models/Settings";
import Earnings from "@/models/Earnings";
import Subscriber from "@/models/Subscriber";
import { cookies } from "next/headers";
import { slugify } from "./utils";
import { revalidateBlog } from "./indexing";

export type BlogData = {
  _id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  tags: string[];
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentData = {
  _id: string;
  blogId: string;
  name: string;
  content: string;
  createdAt: string;
  approved: boolean;
};

export type SettingsData = {
  siteLogo: string;
  adsenseId: string;
  groqKey: string;
  geminiKey: string;
  youtubeKey: string;
  jazzcashNumber: string;
  easypaisaNumber: string;
  bankName: string;
  bankAccount: string;
  bankTitle: string;
  whatsappNumber: string;
};

export type EarningsData = {
  month: string;
  adsense: number;
  meta: number;
};

const DEFAULT_SETTINGS: SettingsData = {
  siteLogo: "",
  adsenseId: "",
  groqKey: "",
  geminiKey: "",
  youtubeKey: "",
  jazzcashNumber: "",
  easypaisaNumber: "",
  bankName: "",
  bankAccount: "",
  bankTitle: "",
  whatsappNumber: "923000000000",
};

async function safeConnect() {
  console.log("[actions.ts] safeConnect START");
  try {
    await connectToDatabase();
    console.log("[actions.ts] safeConnect SUCCESS");
    return true;
  } catch (err) {
    console.warn("[actions.ts] safeConnect FAILED: Database unavailable", err);
    return false;
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAction(email: string, password: string) {
  console.log("[actions.ts] loginAction START for email:", email);
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    console.log("[actions.ts] loginAction: ADMIN_EMAIL in env defined:", !!adminEmail);
    console.log("[actions.ts] loginAction: ADMIN_PASSWORD in env defined:", !!adminPass);

    if (email === adminEmail && password === adminPass) {
      console.log("[actions.ts] loginAction: Credentials matched. Setting admin cookie...");
      const cookieStore = await cookies();
      cookieStore.set("dd_admin", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      console.log("[actions.ts] loginAction SUCCESS");
      return { success: true };
    }

    console.warn("[actions.ts] loginAction FAILURE: Invalid credentials");
    return { success: false, error: "Invalid email or password" };
  } catch (err) {
    console.error("[actions.ts] loginAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Internal server error during login" };
  }
}

export async function logoutAction() {
  console.log("[actions.ts] logoutAction START");
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dd_admin");
    console.log("[actions.ts] logoutAction SUCCESS: Admin cookie deleted");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] logoutAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Internal server error during logout" };
  }
}

export async function isAdmin(): Promise<boolean> {
  console.log("[actions.ts] isAdmin START");
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("dd_admin")?.value;
    const isMatched = cookieValue === "1";
    console.log("[actions.ts] isAdmin check result:", isMatched, "(cookie value:", cookieValue, ")");
    return isMatched;
  } catch (err) {
    console.error("[actions.ts] isAdmin check ERROR:", err);
    return false;
  }
}

export async function checkAdminAction() {
  console.log("[actions.ts] checkAdminAction START");
  try {
    const adminStatus = await isAdmin();
    console.log("[actions.ts] checkAdminAction SUCCESS, status:", adminStatus);
    return { isAdmin: adminStatus };
  } catch (err) {
    console.error("[actions.ts] checkAdminAction ERROR:", err);
    return { isAdmin: false, error: (err as Error).message || "Internal server error during admin check" };
  }
}

// ─── Blogs ─────────────────────────────────────────────────────────────────────
export async function getBlogsAction(): Promise<BlogData[]> {
  console.log("[actions.ts] getBlogsAction START");
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getBlogsAction safeConnect failed, returning empty list");
      return [];
    }
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    console.log("[actions.ts] getBlogsAction SUCCESS. Count:", blogs.length);
    return JSON.parse(JSON.stringify(blogs));
  } catch (err) {
    console.error("[actions.ts] getBlogsAction ERROR:", err);
    return [];
  }
}

export async function getBlogAction(slug: string): Promise<BlogData | null> {
  console.log("[actions.ts] getBlogAction START for slug:", slug);
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getBlogAction safeConnect failed, returning null");
      return null;
    }
    const blog = await Blog.findOne({ slug }).lean();
    console.log("[actions.ts] getBlogAction result found:", !!blog);
    return blog ? JSON.parse(JSON.stringify(blog)) : null;
  } catch (err) {
    console.error("[actions.ts] getBlogAction ERROR:", err);
    return null;
  }
}

export async function saveBlogAction(data: {
  _id?: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  tags: string[];
  image: string;
}) {
  console.log("[actions.ts] saveBlogAction START for title:", data.title, "id:", data._id);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] saveBlogAction unauthorized attempt");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    
    const { _id, ...rest } = data;
    const slug = rest.slug || slugify(rest.title);

    if (_id && _id.trim() !== "") {
      console.log("[actions.ts] saveBlogAction: Updating existing blog ID:", _id);
      await Blog.findByIdAndUpdate(_id, { ...rest, slug, updatedAt: new Date() });
    } else {
      console.log("[actions.ts] saveBlogAction: Creating new blog post");
      await Blog.create({ ...rest, slug, createdAt: new Date(), updatedAt: new Date() });
    }
    await revalidateBlog(slug);
    console.log("[actions.ts] saveBlogAction SUCCESS, slug:", slug);
    return { success: true, slug };
  } catch (err) {
    console.error("[actions.ts] saveBlogAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to save blog" };
  }
}

export async function deleteBlogAction(id: string) {
  console.log("[actions.ts] deleteBlogAction START for ID:", id);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] deleteBlogAction unauthorized attempt");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    console.log("[actions.ts] deleteBlogAction: Deleting blog document");
    await Blog.findByIdAndDelete(id);
    console.log("[actions.ts] deleteBlogAction: Deleting associated comments");
    await Comment.deleteMany({ blogId: id });
    console.log("[actions.ts] deleteBlogAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] deleteBlogAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to delete blog" };
  }
}

// ─── Seed blogs on first load ───────────────────────────────────────────────
export async function seedBlogsIfEmpty() {
  console.log("[actions.ts] seedBlogsIfEmpty START");
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] seedBlogsIfEmpty safeConnect failed, aborting");
      return;
    }
    const count = await Blog.countDocuments();
    console.log("[actions.ts] seedBlogsIfEmpty: Existing blogs count:", count);
    if (count > 0) {
      console.log("[actions.ts] seedBlogsIfEmpty: Database is not empty, skipping seed");
      return;
    }
    console.log("[actions.ts] seedBlogsIfEmpty: Inserting seed data...");
    const seedData = [
      {
        slug: "leopard-courier-rates-2026",
        title: "Leopard Courier Rates in Pakistan 2026 — Complete Guide",
        content: `<h2>Within City Rates</h2><p>Overnight delivery starts at Rs.195 for 500g shipments.</p><h2>Same Province</h2><p>Rs.270 for the first kg, Rs.160 for every extra kg.</p><h2>Different Province</h2><p>Rs.350 base + Rs.180 per extra kg.</p><div class="tip-box">Use our shipping calculator to get exact rates instantly!</div>`,
        metaDescription: "Latest Leopard Courier rates 2026 in Pakistan including COD and fuel surcharge.",
        tags: ["leopard", "courier", "rates", "pakistan"],
        image: "",
        createdAt: new Date(),
      },
      {
        slug: "how-to-start-ecommerce-pakistan",
        title: "How to Start an Ecommerce Business in Pakistan (2026)",
        content: `<h2>Step 1: Pick a Niche</h2><p>Choose a proven niche with demand. Research Daraz bestsellers.</p><h2>Step 2: Source Products</h2><p>Source from Karachi wholesale markets or import from China.</p><h2>Step 3: Go Online</h2><p>Set up a Daraz seller account + your own Shopify store.</p><div class="highlight-box">Focus on tier-1 cities first: Karachi, Lahore, Islamabad.</div>`,
        metaDescription: "Step-by-step guide to launching a profitable ecommerce business in Pakistan in 2026.",
        tags: ["ecommerce", "business", "pakistan", "online"],
        image: "",
        createdAt: new Date(),
      },
      {
        slug: "tcs-vs-leopard-vs-mp",
        title: "TCS vs Leopard vs M&P — Which Courier Is Best for COD?",
        content: `<h2>TCS</h2><p>Premium pricing, fastest delivery, best for high-value items.</p><h2>Leopard</h2><p>Best balance of price and reliability for most sellers.</p><h2>M&P</h2><p>Cheapest option with great rural coverage, slower COD remittance.</p><div class="step-card"><div class="step-number">1</div><div>Compare based on your product value and delivery speed needs.</div></div>`,
        metaDescription: "Detailed comparison of TCS, Leopard, and M&P couriers for Pakistani ecommerce sellers.",
        tags: ["courier", "comparison", "cod", "tcs", "leopard"],
        image: "",
        createdAt: new Date(),
      },
    ];
    await Blog.insertMany(seedData);
    console.log("[actions.ts] seedBlogsIfEmpty SUCCESS: Seed blogs inserted");
  } catch (err) {
    console.error("[actions.ts] seedBlogsIfEmpty ERROR:", err);
  }
}

// ─── Comments ──────────────────────────────────────────────────────────────────
export async function addCommentAction(blogId: string, name: string, content: string) {
  console.log("[actions.ts] addCommentAction START for blogId:", blogId, "name:", name);
  try {
    if (!name.trim() || !content.trim()) {
      console.warn("[actions.ts] addCommentAction: Missing name or content");
      return { success: false, error: "Name and comment required" };
    }
    await connectToDatabase();
    await Comment.create({ blogId, name: name.trim(), content: content.trim() });
    console.log("[actions.ts] addCommentAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] addCommentAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to add comment" };
  }
}

export async function getCommentsAction(blogId: string): Promise<CommentData[]> {
  console.log("[actions.ts] getCommentsAction START for blogId:", blogId);
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getCommentsAction safeConnect failed");
      return [];
    }
    const comments = await Comment.find({ blogId, approved: true }).sort({ createdAt: -1 }).lean();
    console.log("[actions.ts] getCommentsAction SUCCESS. Count:", comments.length);
    return JSON.parse(JSON.stringify(comments));
  } catch (err) {
    console.error("[actions.ts] getCommentsAction ERROR:", err);
    return [];
  }
}

export async function getAllCommentsAction(): Promise<CommentData[]> {
  console.log("[actions.ts] getAllCommentsAction START");
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] getAllCommentsAction unauthorized");
      return [];
    }
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getAllCommentsAction safeConnect failed");
      return [];
    }
    const comments = await Comment.find({}).sort({ createdAt: -1 }).lean();
    console.log("[actions.ts] getAllCommentsAction SUCCESS. Count:", comments.length);
    return JSON.parse(JSON.stringify(comments));
  } catch (err) {
    console.error("[actions.ts] getAllCommentsAction ERROR:", err);
    return [];
  }
}

export async function deleteCommentAction(id: string) {
  console.log("[actions.ts] deleteCommentAction START for ID:", id);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] deleteCommentAction unauthorized");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    await Comment.findByIdAndDelete(id);
    console.log("[actions.ts] deleteCommentAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] deleteCommentAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to delete comment" };
  }
}

export async function toggleCommentAction(id: string, approved: boolean) {
  console.log("[actions.ts] toggleCommentAction START for ID:", id, "approved:", approved);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] toggleCommentAction unauthorized");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    await Comment.findByIdAndUpdate(id, { approved });
    console.log("[actions.ts] toggleCommentAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] toggleCommentAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to toggle comment status" };
  }
}

// ─── Settings ──────────────────────────────────────────────────────────────────
export async function getSettingsAction(): Promise<SettingsData> {
  console.log("[actions.ts] getSettingsAction START");
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getSettingsAction safeConnect failed, returning defaults");
      return DEFAULT_SETTINGS;
    }
    const s = await Settings.findOne({ key: "site_settings" }).lean();
    const dbSettings = s ? JSON.parse(JSON.stringify(s)) : {};
    console.log("[actions.ts] getSettingsAction: loaded from DB, keys present:", Object.keys(dbSettings));
    return {
      siteLogo: dbSettings.siteLogo || "",
      adsenseId: dbSettings.adsenseId || "",
      groqKey: dbSettings.groqKey || process.env.GROQ_API_KEY || "",
      geminiKey: dbSettings.geminiKey || process.env.GEMINI_API_KEY || "",
      youtubeKey: dbSettings.youtubeKey || process.env.YOUTUBE_API_KEY || "",
      jazzcashNumber: dbSettings.jazzcashNumber || "",
      easypaisaNumber: dbSettings.easypaisaNumber || "",
      bankName: dbSettings.bankName || "",
      bankAccount: dbSettings.bankAccount || "",
      bankTitle: dbSettings.bankTitle || "",
      whatsappNumber: dbSettings.whatsappNumber || "923000000000",
    };
  } catch (err) {
    console.error("[actions.ts] getSettingsAction ERROR:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsAction(data: {
  siteLogo?: string;
  adsenseId?: string;
  groqKey?: string;
  geminiKey?: string;
  youtubeKey?: string;
  jazzcashNumber?: string;
  easypaisaNumber?: string;
  bankName?: string;
  bankAccount?: string;
  bankTitle?: string;
  whatsappNumber?: string;
}) {
  console.log("[actions.ts] saveSettingsAction START");
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] saveSettingsAction unauthorized");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    await Settings.findOneAndUpdate({ key: "site_settings" }, { ...data }, { upsert: true, new: true });
    console.log("[actions.ts] saveSettingsAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] saveSettingsAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to save settings" };
  }
}

// ─── Earnings ──────────────────────────────────────────────────────────────────
export async function getEarningsAction(month?: string): Promise<EarningsData> {
  const m = month || new Date().toISOString().slice(0, 7);
  console.log("[actions.ts] getEarningsAction START for month:", m);
  try {
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getEarningsAction safeConnect failed, returning empty tracker");
      return { month: m, adsense: 0, meta: 0 };
    }
    const e = await Earnings.findOne({ month: m }).lean();
    console.log("[actions.ts] getEarningsAction: Earnings record found:", !!e);
    if (!e) return { month: m, adsense: 0, meta: 0 };
    return JSON.parse(JSON.stringify(e));
  } catch (err) {
    console.error("[actions.ts] getEarningsAction ERROR:", err);
    return { month: m, adsense: 0, meta: 0 };
  }
}

export async function getAllEarningsAction(): Promise<EarningsData[]> {
  console.log("[actions.ts] getAllEarningsAction START");
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] getAllEarningsAction unauthorized");
      return [];
    }
    if (!(await safeConnect())) {
      console.warn("[actions.ts] getAllEarningsAction safeConnect failed");
      return [];
    }
    const all = await Earnings.find({}).sort({ month: -1 }).lean();
    console.log("[actions.ts] getAllEarningsAction SUCCESS. Count:", all.length);
    return JSON.parse(JSON.stringify(all));
  } catch (err) {
    console.error("[actions.ts] getAllEarningsAction ERROR:", err);
    return [];
  }
}

export async function saveEarningsAction(month: string, adsense: number, meta: number) {
  console.log("[actions.ts] saveEarningsAction START for month:", month, "adsense:", adsense, "meta:", meta);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] saveEarningsAction unauthorized");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    await Earnings.findOneAndUpdate({ month }, { month, adsense, meta }, { upsert: true, new: true });
    console.log("[actions.ts] saveEarningsAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] saveEarningsAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to save earnings" };
  }
}

// ─── Subscribers ───────────────────────────────────────────────────────────────
export async function subscribeAction(email: string) {
  console.log("[actions.ts] subscribeAction START for email:", email);
  try {
    if (!email || !email.includes("@")) {
      console.warn("[actions.ts] subscribeAction INVALID email:", email);
      return { success: false, error: "Invalid email" };
    }
    await connectToDatabase();
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log("[actions.ts] subscribeAction: already subscribed");
      return { success: true, alreadySubscribed: true };
    }
    await Subscriber.create({ email: email.toLowerCase() });
    console.log("[actions.ts] subscribeAction SUCCESS");
    return { success: true };
  } catch (err) {
    console.error("[actions.ts] subscribeAction ERROR:", err);
    return { success: false, error: (err as Error).message || "Failed to subscribe" };
  }
}

export async function getSubscribersAction() {
  console.log("[actions.ts] getSubscribersAction START");
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] getSubscribersAction unauthorized");
      return [];
    }
    await connectToDatabase();
    const subs = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
    console.log("[actions.ts] getSubscribersAction SUCCESS. Count:", subs.length);
    return JSON.parse(JSON.stringify(subs));
  } catch (err) {
    console.error("[actions.ts] getSubscribersAction ERROR:", err);
    return [];
  }
}

// ─── AI Generation (Server-side, keys never exposed to client) ─────────────────
export async function generateBlogAction(topic: string) {
  console.log("[actions.ts] generateBlogAction START for topic:", topic);
  try {
    if (!(await isAdmin())) {
      console.warn("[actions.ts] generateBlogAction unauthorized");
      return { success: false, error: "Unauthorized" };
    }
    await connectToDatabase();
    const settings = await getSettingsAction();
    const groqKey = settings.groqKey || process.env.GROQ_API_KEY || "";
    console.log("[actions.ts] generateBlogAction: groqKey length:", groqKey.length);
    if (!groqKey) {
      console.warn("[actions.ts] generateBlogAction: missing groqKey");
      return { success: false, error: "No Groq API key configured in Settings." };
    }

    const BLOG_HTML_REQUIREMENTS = `Write content as valid HTML only (never Markdown), with at least 6 <h2> sections and minimum 1200 words. Include at least one each of <div class="tip-box">, <div class="warning-box">, <div class="step-card">, and <div class="highlight-box">. Always include a proper HTML comparison table (<table>) with relevant data. Use real Pakistani prices, examples, and city names where relevant. First paragraph must be engaging and hook the reader. Each <h2> section must have at least 2-3 paragraphs of detailed content. Add a FAQ section at the end with at least 3 questions in <h3> tags.`;
    const prompt = `Write a complete SEO blog post in Roman Urdu + English mix for a Pakistani audience about: "${topic}".
${BLOG_HTML_REQUIREMENTS}

Return ONLY this JSON (no markdown, no backticks):
{
  "title": "SEO optimized title here",
  "slug": "url-friendly-slug-here",
  "metaDescription": "150 char meta description",
  "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "content": "valid styled HTML using all required CSS classes",
  "IMAGE_PROMPT": "Detailed prompt for generating a highly realistic, professional DSLR photograph representing this topic, suitable for a premium blog banner. Describe real-world items, clean lighting, and avoid any illustration, drawing, or clip-art keywords."
}`;

    console.log("[actions.ts] generateBlogAction: Sending API request to Groq...");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3000,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[actions.ts] generateBlogAction: Groq API error response status:", res.status, data);
      return { success: false, error: data?.error?.message || `Groq ${res.status}` };
    }
    const text: string = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const m = clean.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : clean);
    
    // Fallback and prompt are optimized for realistic photography instead of cartoons/illustrations
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.IMAGE_PROMPT || topic + ", professional DSLR photography, realistic, high resolution, detailed, studio lighting")}?width=1200&height=630&nologo=true`;
    console.log("[actions.ts] generateBlogAction SUCCESS: Blog generated successfully");
    return {
      success: true,
      blog: {
        title: parsed.title || topic,
        slug: parsed.slug || slugify(parsed.title || topic),
        metaDescription: parsed.metaDescription || "",
        tags: (parsed.keywords || "").split(",").map((s: string) => s.trim()).filter(Boolean),
        content: parsed.content || "",
        image: imageUrl,
      },
    };
  } catch (err) {
    console.error("[actions.ts] generateBlogAction ERROR:", err);
    return { success: false, error: (err as Error).message };
  }
}
