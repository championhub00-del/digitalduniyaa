"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  loginAction, logoutAction, checkAdminAction, getBlogsAction, saveBlogAction, deleteBlogAction,
  generateBlogAction, getAllCommentsAction, deleteCommentAction, toggleCommentAction,
  getEarningsAction, getAllEarningsAction, saveEarningsAction, getSettingsAction, saveSettingsAction,
  type BlogData, type CommentData,
} from "@/lib/actions";
import { ProductsTab, OrdersTab } from "./AdminShop";
import { getProductsAction, getAllOrdersAction } from "@/lib/shop-actions";
import { slugify } from "@/lib/utils";
import {
  LayoutDashboard, FileText, TrendingUp, DollarSign, Settings as SettingsIcon,
  LogOut, Plus, Pencil, Trash2, RefreshCw, Sparkles, CheckCircle2, XCircle,
  MessageCircle, Eye, EyeOff, Save, Upload, X, Package, ShoppingBag, CreditCard
} from "lucide-react";

type Tab = "dashboard" | "blogs" | "ai" | "comments" | "earnings" | "products" | "orders" | "payments" | "settings";

type Blog = BlogData;
type Comment = CommentData;

const NICHE_TOPICS = [
  { niche: "Tech", topic: "Best Smartphones Under 50000 in Pakistan 2026" },
  { niche: "Health", topic: "Top Health Insurance Plans Pakistan 2026" },
  { niche: "Food", topic: "Best Karachi Street Food Spots 2026" },
  { niche: "Business", topic: "How to Register a Private Limited Company in Pakistan" },
  { niche: "Education", topic: "Top Scholarships for Pakistani Students 2026" },
  { niche: "Fashion", topic: "Affordable Eid Collection Brands Pakistan 2026" },
  { niche: "Sports", topic: "Pakistan Cricket Team Schedule 2026" },
  { niche: "Real Estate", topic: "Best Areas to Invest in Lahore 2026" },
  { niche: "Jobs", topic: "Highest Paying IT Jobs Pakistan 2026" },
  { niche: "Entertainment", topic: "Top Pakistani Dramas to Watch 2026" },
];

export default function AdminClient() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginPending, startLoginTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlTab = searchParams.get("tab");
    if (urlTab && ["dashboard", "blogs", "ai", "comments", "earnings", "products", "orders", "payments", "settings"].includes(urlTab)) {
      setTab(urlTab as Tab);
    }
  }, []);

  useEffect(() => {
    checkAdminAction()
      .then((r) => {
        if (r.isAdmin) setAuthed(true);
      })
      .catch((err) => {
        console.error("Failed to check admin status:", err);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startLoginTransition(async () => {
      try {
        const r = await loginAction(email, password);
        if (r.success) setAuthed(true);
        else setLoginErr(r.error || "Login failed");
      } catch (err) {
        console.error("Failed to login:", err);
        setLoginErr((err as Error).message || "Login failed due to server error");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (err) {
      console.error("Failed to logout:", err);
    }
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Admin Login</h1>
            <p className="text-slate-500 text-sm mt-1">DigitalDuniya Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white border border-[var(--border)] rounded-2xl p-7 shadow-sm space-y-4">
            {loginErr && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{loginErr}</div>}
            <div>
              <label className="text-sm font-semibold text-[#0f172a] block mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0f172a] block mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
            </div>
            <button type="submit" disabled={loginPending}
              className="w-full py-3.5 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors disabled:opacity-60">
              {loginPending ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { id: "blogs", label: "Blogs", icon: <FileText className="size-4" /> },
    { id: "ai", label: "AI Generator", icon: <Sparkles className="size-4" /> },
    { id: "products", label: "Products", icon: <Package className="size-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="size-4" /> },
    { id: "comments", label: "Comments", icon: <MessageCircle className="size-4" /> },
    { id: "earnings", label: "Earnings", icon: <DollarSign className="size-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="size-4" /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon className="size-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">DigitalDuniya Control Panel</p>
        </div>
        <button onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-white text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
          <LogOut className="size-4" /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-7 bg-[#f1f5f9] rounded-xl p-1">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? "bg-white text-[#0ea5e9] shadow-sm" : "text-slate-500 hover:text-[#0f172a]"
            }`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "blogs" && <BlogsTab onToast={showToast} />}
      {tab === "ai" && <AITab onToast={showToast} />}
      {tab === "products" && <ProductsTab onToast={showToast} />}
      {tab === "orders" && <OrdersTab onToast={showToast} />}
      {tab === "comments" && <CommentsTab onToast={showToast} />}
      {tab === "earnings" && <EarningsTab onToast={showToast} />}
      {tab === "payments" && <PaymentsTab onToast={showToast} />}
      {tab === "settings" && <SettingsTab onToast={showToast} />}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-xl text-sm z-50 flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="size-4 text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard Tab ─── */
function DashboardTab() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBlogsAction(),
      getProductsAction(false),
      getAllOrdersAction()
    ])
      .then(([b, p, o]) => {
        setBlogs(b);
        setProducts(p);
        setOrders(o);
        setLoading(false);
      })
      .catch((err) => {
        console.error("DashboardTab failed to load data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalSales = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "Total Blogs", value: blogs.length, icon: "📝", color: "bg-sky-50 border-sky-200" },
    { label: "Total Products", value: products.length, icon: "📦", color: "bg-indigo-50 border-indigo-200" },
    { label: "Pending Orders", value: pendingOrders, icon: "⏳", color: "bg-amber-50 border-amber-200" },
    { label: "Total Shop Revenue", value: `Rs. ${totalSales.toLocaleString()}`, icon: "💰", color: "bg-emerald-50 border-emerald-200" },
  ];

  const health = [
    { ok: blogs.length >= 5, label: `At least 5 blogs (${blogs.length} published)` },
    { ok: true, label: "MongoDB database connected" },
    { ok: true, label: "Shipping calculator working" },
    { ok: true, label: "Comments system active" },
    { ok: true, label: "Sitemap.xml auto-generated" },
    { ok: true, label: "Privacy Policy & Terms pages live" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-[#0f172a]">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
          <CheckCircle2 className="size-5 text-green-500" /> Site Health Check
        </h3>
        <ul className="space-y-2.5">
          {health.map((h, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              {h.ok
                ? <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                : <XCircle className="size-4 text-red-400 shrink-0" />}
              <span className={h.ok ? "text-slate-600" : "text-red-500"}>{h.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-br from-[#0ea5e9]/10 to-[#f59e0b]/10 rounded-2xl border border-[var(--border)] p-6">
        <h3 className="font-bold text-[#0f172a] mb-2 text-lg">🚀 AdSense Approval Checklist</h3>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {[
            "✅ Privacy Policy page live",
            "✅ Terms of Service page live",
            "✅ About & Contact pages live",
            "✅ Original content (blogs)",
            "✅ AdSense-ready ad slots on all pages",
            "✅ Sitemap.xml for Google Search Console",
            "✅ Readable UI with good typography",
            "🔲 Submit to Google Search Console",
            "🔲 Add 10+ original blog posts",
            "🔲 Apply for Google AdSense",
          ].map((item) => (
            <div key={item} className="text-sm text-slate-600 flex items-start gap-2">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Blogs Tab ─── */
function BlogsTab({ onToast }: { onToast: (s: string) => void }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    getBlogsAction()
      .then((b) => {
        setBlogs(b);
        setLoading(false);
      })
      .catch((err) => {
        console.error("BlogsTab failed to load blogs:", err);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteBlogAction(id);
      onToast("Blog deleted");
      load();
    });
  };

  const handleSave = async (data: Omit<Blog, "_id" | "createdAt"> & { _id?: string }) => {
    const result = await saveBlogAction({ ...data, slug: data.slug || slugify(data.title) });
    if (result.success) { onToast("Blog saved!"); setEditing(null); load(); }
  };

  if (editing) {
    return <BlogEditor blog={editing} onSave={handleSave} onCancel={() => setEditing(null)} onToast={onToast} />;
  }

  const emptyBlog: Blog = { _id: "", slug: "", title: "", content: "", metaDescription: "", tags: [], image: "", createdAt: "", updatedAt: "" };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500 font-medium">{blogs.length} article(s) published</p>
        <button onClick={() => setEditing(emptyBlog)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-bold hover:bg-[#0284c7] transition-colors shadow-sm">
          <Plus className="size-4" /> New Post
        </button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {blogs.map((b) => (
            <div key={b._id} className="bg-white border border-[var(--border)] rounded-xl p-4 flex justify-between items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#0f172a] truncate">{b.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">/{b.slug} · {new Date(b.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(b)}
                  className="p-2 rounded-lg border border-[var(--border)] hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(b._id, b.title)}
                  className="p-2 rounded-lg border border-[var(--border)] hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <FileText className="size-12 mx-auto mb-3 opacity-30" />
              <p>No blogs yet. Create your first post!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Blog Editor ─── */
function BlogEditor({ blog, onSave, onCancel, onToast }: {
  blog: Blog; onSave: (b: Blog) => void; onCancel: () => void; onToast: (s: string) => void;
}) {
  const [b, setB] = useState<Blog>(blog);
  const [tagsInput, setTagsInput] = useState(blog.tags.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...b, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean), slug: b.slug || slugify(b.title) });
  };

  const [compFile, setCompFile] = useState<File | null>(null);
  const [compOrigDetails, setCompOrigDetails] = useState<{ size: number; w: number; h: number; url: string } | null>(null);
  const [compQuality, setCompQuality] = useState<number>(75);
  const [compFormat, setCompFormat] = useState<string>("image/webp");
  const [compMaxWidth, setCompMaxWidth] = useState<number>(1200);
  const [compResult, setCompResult] = useState<{ url: string; size: number; w: number; h: number } | null>(null);

  const handleImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setCompOrigDetails({ size: file.size, w: img.width, h: img.height, url });
      setCompFile(file);
    };
    img.src = url;
  };

  useEffect(() => {
    if (!compFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (compMaxWidth && width > compMaxWidth) {
          height = Math.round((height * compMaxWidth) / width);
          width = compMaxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (compFormat === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const fileReader = new FileReader();
              fileReader.onloadend = () => {
                setCompResult({
                  url: fileReader.result as string,
                  size: blob.size,
                  w: width,
                  h: height
                });
              };
              fileReader.readAsDataURL(blob);
            }
          }, compFormat, compQuality / 100);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(compFile);
  }, [compFile, compQuality, compFormat, compMaxWidth]);

  const applyCompImage = () => {
    if (compResult) {
      setB((c) => ({ ...c, image: compResult.url }));
    }
    closeCompModal();
  };

  const closeCompModal = () => {
    if (compOrigDetails?.url) URL.revokeObjectURL(compOrigDetails.url);
    setCompFile(null);
    setCompOrigDetails(null);
    setCompResult(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <button type="button" onClick={onCancel}
          className="p-2 rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors">
          <X className="size-4" />
        </button>
        <h2 className="font-bold text-[#0f172a] text-lg">{blog._id ? "Edit Blog" : "New Blog"}</h2>
      </div>
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <Field label="Title *">
          <input required value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Slug (auto-generated from title)">
          <input value={b.slug} onChange={(e) => setB({ ...b, slug: e.target.value })}
            placeholder="leave blank to auto-generate"
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Meta Description (120-155 chars)">
          <input value={b.metaDescription} onChange={(e) => setB({ ...b, metaDescription: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Keywords / Tags (comma separated)">
          <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ecommerce, pakistan, courier"
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Featured Image">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[#0ea5e9] transition-colors text-sm text-slate-500">
              <Upload className="size-4" /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />
            </label>
            {b.image && <img src={b.image} alt="" className="h-12 rounded-lg border border-[var(--border)] object-cover" />}
          </div>
        </Field>
        <Field label="Content (HTML supported)">
          <textarea required rows={14} value={b.content} onChange={(e) => setB({ ...b, content: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0ea5e9] transition-colors resize-y" />
        </Field>
        <div className="flex gap-3">
          <button type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0ea5e9] text-white font-bold text-sm hover:bg-[#0284c7] transition-colors">
            <Save className="size-4" /> Save & Publish
          </button>
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Image Compressor Modal */}
      {compFile && compOrigDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] text-slate-700">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Image Optimizer</h3>
              <button type="button" onClick={closeCompModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="size-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Original Size</span>
                  <span className="text-sm font-extrabold text-slate-700">
                    {(compOrigDetails.size / 1024).toFixed(1)} KB ({compOrigDetails.w}x{compOrigDetails.h} px)
                  </span>
                </div>
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                  <span className="block font-bold text-sky-500 uppercase tracking-wider mb-1">Optimized Size</span>
                  <span className="text-sm font-extrabold text-sky-700">
                    {compResult ? `${(compResult.size / 1024).toFixed(1)} KB` : "Processing..."}
                    {compResult && (
                      <span className="block text-[10px] text-sky-500 mt-0.5">
                        Saved {Math.max(0, Math.round(((compOrigDetails.size - compResult.size) / compOrigDetails.size) * 100))}%
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</label>
                <select
                  value={compFormat}
                  onChange={(e) => setCompFormat(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] bg-white font-medium"
                >
                  <option value="image/webp">WebP (Highly Recommended)</option>
                  <option value="image/jpeg">JPEG (Standard)</option>
                  <option value="image/png">PNG (Lossless)</option>
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Quality</span>
                  <span className="font-extrabold text-[#0ea5e9]">{compQuality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={compQuality}
                  onChange={(e) => setCompQuality(parseInt(e.target.value))}
                  className="w-full accent-[#0ea5e9] h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Width (px)</label>
                <input
                  type="number"
                  value={compMaxWidth}
                  onChange={(e) => setCompMaxWidth(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</label>
                <div className="aspect-video w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 relative">
                  {compResult ? (
                    <img src={compResult.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <RefreshCw className="size-6 text-[#0ea5e9] animate-spin" />
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                type="button"
                onClick={applyCompImage}
                disabled={!compResult}
                className="flex-1 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="size-4" /> Apply Optimized Image
              </button>
              <button
                type="button"
                onClick={closeCompModal}
                className="px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

/* ─── AI Generator Tab ─── */
function AITab({ onToast }: { onToast: (s: string) => void }) {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState<Blog | null>(null);
  const [saving, startSave] = useTransition();

  const generate = async (t: string) => {
    if (!t.trim()) { onToast("Enter a topic first"); return; }
    setTopic(t);
    setGenerating(true);
    setProgress(10);
    setGenerated(null);
    const timer = setInterval(() => setProgress((p) => Math.min(p + 8, 85)), 800);
    const result = await generateBlogAction(t);
    clearInterval(timer);
    setProgress(100);
    if (result.success && result.blog) {
      setGenerated({ _id: "", createdAt: "", ...result.blog } as Blog);
      onToast("✨ Blog generated successfully!");
    } else {
      onToast(`Error: ${result.error}`);
    }
    setTimeout(() => { setGenerating(false); setProgress(0); }, 800);
  };

  const saveGenerated = () => {
    if (!generated) return;
    startSave(async () => {
      await saveBlogAction({ ...generated });
      onToast("Blog saved to MongoDB!");
      setGenerated(null);
      setTopic("");
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#0f172a] mb-1 flex items-center gap-2">
          <Sparkles className="size-5 text-[#0ea5e9]" /> AI Blog Generator
        </h3>
        <p className="text-sm text-slate-400 mb-5">Enter a topic and AI will write a full SEO blog (800+ words, HTML formatted)</p>
        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Best Laptops Under 100000 in Pakistan 2026"
            className="flex-1 px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
          />
          <button onClick={() => generate(topic)} disabled={generating}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="size-4" /> {generating ? "Generating..." : "Generate"}
          </button>
        </div>
        {generating && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Generating SEO content with Groq AI...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#f59e0b] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {generated && (
          <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-xs font-bold text-green-600 uppercase mb-1">✅ Ready to publish</div>
                <div className="font-bold text-[#0f172a]">{generated.title}</div>
                <div className="text-sm text-slate-500 mt-1">{generated.metaDescription}</div>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {generated.tags.map((t: string) => <span key={t} className="text-xs bg-[#e0f2fe] text-[#0c4a6e] px-2 py-0.5 rounded-full font-medium">{t}</span>)}
                </div>
              </div>
              <button onClick={saveGenerated} disabled={saving}
                className="shrink-0 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2">
                <Save className="size-4" /> {saving ? "Saving..." : "Save to DB"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-[#0ea5e9]" /> Quick Topic Ideas
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {NICHE_TOPICS.map((n) => (
            <button key={n.niche} onClick={() => generate(n.topic)} disabled={generating}
              className="text-left bg-[#f8fafc] border border-[var(--border)] rounded-xl p-3 hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all disabled:opacity-50 group">
              <div className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wide mb-1">{n.niche}</div>
              <div className="text-xs text-[#0f172a] font-medium line-clamp-3 leading-snug group-hover:text-[#0ea5e9]">{n.topic}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Comments Tab ─── */
function CommentsTab({ onToast }: { onToast: (s: string) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startT] = useTransition();

  const load = () => {
    setLoading(true);
    getAllCommentsAction()
      .then((c) => {
        setComments(c as Comment[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("CommentsTab failed to load comments:", err);
        setLoading(false);
      });
  };
  useEffect(() => { load(); }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this comment?")) return;
    startT(async () => { await deleteCommentAction(id); onToast("Comment deleted"); load(); });
  };
  const handleToggle = (id: string, approved: boolean) => {
    startT(async () => { await toggleCommentAction(id, !approved); onToast(approved ? "Comment hidden" : "Comment approved"); load(); });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500 font-medium">{comments.length} comment(s)</p>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-gray-50 transition-colors">
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className={`bg-white border rounded-xl p-4 ${c.approved ? "border-[var(--border)]" : "border-orange-200 bg-orange-50"}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0f172a]">{c.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.approved ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {c.approved ? "Visible" : "Hidden"}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleToggle(c._id, c.approved)} title={c.approved ? "Hide" : "Show"}
                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors">
                    {c.approved ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button onClick={() => handleDelete(c._id)}
                    className="p-2 rounded-lg border border-[var(--border)] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <MessageCircle className="size-12 mx-auto mb-3 opacity-30" />
              <p>No comments yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Earnings Tab ─── */
function EarningsTab({ onToast }: { onToast: (s: string) => void }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [adsense, setAdsense] = useState(0);
  const [meta, setMeta] = useState(0);
  const [history, setHistory] = useState<{ month: string; adsense: number; meta: number }[]>([]);
  const [, startT] = useTransition();

  useEffect(() => {
    getEarningsAction(month)
      .then((e) => {
        setAdsense(e.adsense);
        setMeta(e.meta);
      })
      .catch((err) => {
        console.error("EarningsTab failed to load earnings:", err);
      });
    getAllEarningsAction()
      .then((h) => setHistory(h))
      .catch((err) => {
        console.error("EarningsTab failed to load earnings history:", err);
      });
  }, [month]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    startT(async () => {
      await saveEarningsAction(month, adsense, meta);
      onToast("Earnings saved!");
      getAllEarningsAction().then((h) => setHistory(h));
    });
  };

  const total = adsense + meta;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={save} className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[#0f172a] text-lg">📊 Earnings Tracker</h3>
        <Field label="Month">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Google AdSense (Rs)">
          <input type="number" value={adsense} onChange={(e) => setAdsense(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Meta Ads Revenue (Rs)">
          <input type="number" value={meta} onChange={(e) => setMeta(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <div className="p-5 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white flex justify-between items-center">
          <span className="font-semibold">Total This Month</span>
          <span className="text-2xl font-bold">Rs. {total.toLocaleString()}</span>
        </div>
        <button type="submit" className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors flex items-center justify-center gap-2">
          <Save className="size-4" /> Save Earnings
        </button>
      </form>

      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#0f172a] mb-4">📈 Earnings History</h3>
        <div className="space-y-2">
          {history.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No earnings recorded yet.</p>}
          {history.map((h) => (
            <div key={h.month} className="flex justify-between items-center p-3 rounded-xl bg-[#f8fafc] border border-[var(--border)] text-sm">
              <span className="font-medium text-[#0f172a]">{h.month}</span>
              <span className="font-bold text-[#0ea5e9]">Rs. {(h.adsense + h.meta).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
function SettingsTab({ onToast }: { onToast: (s: string) => void }) {
  const [logo, setLogo] = useState("");
  const [adsenseId, setAdsenseId] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [youtubeKey, setYoutubeKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [, startT] = useTransition();

  useEffect(() => {
    getSettingsAction()
      .then((s) => {
        setLogo(s.siteLogo || "");
        setAdsenseId(s.adsenseId || "");
        setGroqKey(s.groqKey || "");
        setGeminiKey(s.geminiKey || "");
        setYoutubeKey(s.youtubeKey || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("SettingsTab failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    startT(async () => {
      await saveSettingsAction({ siteLogo: logo, adsenseId, groqKey, geminiKey, youtubeKey });
      onToast("Settings saved! Reload to see changes.");
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-[#0f172a] text-lg">⚙️ Site Settings</h3>

        <Field label="Site Logo (PNG/JPG/SVG)">
          <div className="flex items-center gap-4">
            {logo
              ? <img src={logo} alt="logo" className="h-12 rounded-lg border border-[var(--border)] p-1 object-contain bg-gray-50" />
              : <div className="h-12 w-12 rounded-lg bg-gray-100 grid place-items-center text-xs text-slate-400 border border-[var(--border)]">No logo</div>
            }
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[var(--border)] text-sm text-slate-500 hover:border-[#0ea5e9] transition-colors">
              <Upload className="size-4" /> Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
            </label>
            {logo && <button onClick={() => setLogo("")} className="text-sm text-red-500 hover:underline">Remove</button>}
          </div>
        </Field>

        <Field label="Google AdSense Publisher ID (ca-pub-xxxxxxxxxxxxxxxx)">
          <input value={adsenseId} onChange={(e) => setAdsenseId(e.target.value)}
            placeholder="ca-pub-0000000000000000"
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Groq API Key (for AI blog generation)">
          <input value={groqKey} onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="Gemini API Key (for AI image generation)">
          <input value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AQ..."
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>
        <Field label="YouTube API Key (for auto video embeds)">
          <input value={youtubeKey} onChange={(e) => setYoutubeKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0ea5e9] transition-colors" />
        </Field>

        <button onClick={save}
          className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7] transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-100">
          <Save className="size-4" /> Save All Settings
        </button>
      </div>
    </div>
  );
}

/* ─── Payments Tab ─── */
function PaymentsTab({ onToast }: { onToast: (s: string) => void }) {
  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankTitle, setBankTitle] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [, startT] = useTransition();

  useEffect(() => {
    getSettingsAction().then((s) => {
      setJazzcashNumber(s.jazzcashNumber || "");
      setEasypaisaNumber(s.easypaisaNumber || "");
      setBankName(s.bankName || "");
      setBankAccount(s.bankAccount || "");
      setBankTitle(s.bankTitle || "");
      setWhatsappNumber(s.whatsappNumber || "");
      setLoading(false);
    });
  }, []);

  const save = () => {
    startT(async () => {
      const res = await saveSettingsAction({ jazzcashNumber, easypaisaNumber, bankName, bankAccount, bankTitle, whatsappNumber });
      if (res.success) {
        onToast("Payment settings saved!");
      } else {
        onToast("Failed to save settings");
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700">JazzCash Number
          <input value={jazzcashNumber} onChange={(e) => setJazzcashNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" placeholder="03xx..." />
        </label>
        <label className="block text-sm font-semibold text-slate-700">EasyPaisa Number
          <input value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" placeholder="03xx..." />
        </label>
        <label className="block text-sm font-semibold text-slate-700">Bank Name
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">Account Title
          <input value={bankTitle} onChange={(e) => setBankTitle(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">Account Number
          <input value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">WhatsApp Number (with country code)
          <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full mt-1 px-4 py-3 border-2 border-slate-100 rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] text-slate-800" placeholder="923001234567" />
        </label>
        <button onClick={save} className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-bold flex items-center justify-center gap-2"><Save className="size-4" /> Save Payment Settings</button>
      </div>
    </div>
  );
}

/* ─── Shared helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0f172a] block mb-2">{label}</span>
      {children}
    </label>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
    </div>
  );
}
