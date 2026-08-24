"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getProductsAction,
  saveProductAction,
  deleteProductAction,
  getAllOrdersAction,
  updateOrderStatusAction,
  type ProductData,
  type OrderData,
} from "@/lib/shop-actions";
import { slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, Package, ShoppingBag, CheckCircle2, XCircle, Clock } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0f172a] block mb-2">{label}</span>
      {children}
    </label>
  );
}

const emptyProduct: ProductData = {
  _id: "",
  slug: "",
  title: "",
  shortDescription: "",
  description: "",
  price: 0,
  comparePrice: 0,
  category: "business",
  image: "",
  fileUrl: "",
  fileType: "PDF",
  featured: false,
  published: true,
  createdAt: "",
  updatedAt: "",
};

export function ProductsTab({ onToast }: { onToast: (s: string) => void }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startT] = useTransition();

  const load = () => {
    setLoading(true);
    getProductsAction(false)
      .then((p) => { setProducts(p); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    startT(async () => {
      await deleteProductAction(id);
      onToast("Product deleted");
      load();
    });
  };

  const handleSave = () => {
    if (!editing) return;
    startT(async () => {
      const r = await saveProductAction({
        ...editing,
        slug: editing.slug || slugify(editing.title),
      });
      if (r.success) { onToast("Product saved & search engines notified!"); setEditing(null); load(); }
      else onToast(r.error || "Save failed");
    });
  };

  if (editing) {
    return (
      <div className="max-w-2xl bg-white border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-lg">{editing._id ? "Edit Product" : "New Product"}</h3>
        <Field label="Title">
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Slug">
          <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
            placeholder={slugify(editing.title)}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Short Description">
          <textarea value={editing.shortDescription} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
            rows={2} className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Full Description (HTML)">
          <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            rows={5} className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm font-mono focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (PKR, 0 = free)">
            <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
          </Field>
          <Field label="Compare Price">
            <input type="number" value={editing.comparePrice} onChange={(e) => setEditing({ ...editing, comparePrice: Number(e.target.value) })}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]">
              <option value="business">Business</option>
              <option value="templates">Templates</option>
              <option value="ebooks">Ebooks</option>
              <option value="tools">Tools</option>
            </select>
          </Field>
          <Field label="File Type">
            <input value={editing.fileType} onChange={(e) => setEditing({ ...editing, fileType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
          </Field>
        </div>
        <Field label="Download URL (Google Drive, Dropbox, etc.)">
          <input value={editing.fileUrl} onChange={(e) => setEditing({ ...editing, fileUrl: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <Field label="Image URL">
          <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })}
            className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]" />
        </Field>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7]">Save Product</button>
          <button onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-xl border border-[var(--border)]">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-slate-500">{products.length} product(s)</p>
        <button onClick={() => setEditing({ ...emptyProduct })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-bold hover:bg-[#0284c7]">
          <Plus className="size-4" /> New Product
        </button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p._id} className="bg-white border border-[var(--border)] rounded-xl p-4 flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-xs text-slate-400">
                  /shop/{p.slug} · {p.price <= 0 ? "Free" : `Rs.${p.price}`} · {p.published ? "Live" : "Draft"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setEditing(p)} className="p-2 rounded-lg border hover:border-[#0ea5e9]"><Pencil className="size-4" /></button>
                <button onClick={() => handleDelete(p._id, p.title)} className="p-2 rounded-lg border hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Package className="size-12 mx-auto mb-3 opacity-30" />
              <p>No products yet. Add your first digital product!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OrdersTab({ onToast }: { onToast: (s: string) => void }) {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startT] = useTransition();

  const load = () => {
    setLoading(true);
    getAllOrdersAction()
      .then((o) => { setOrders(o); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = (orderId: string, status: "pending" | "paid" | "cancelled") => {
    startT(async () => {
      await updateOrderStatusAction(orderId, status);
      onToast(`Order ${orderId} → ${status}`);
      load();
    });
  };

  const statusIcon = (s: string) => {
    if (s === "paid") return <CheckCircle2 className="size-4 text-green-500" />;
    if (s === "cancelled") return <XCircle className="size-4 text-red-500" />;
    return <Clock className="size-4 text-amber-500" />;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o._id} className="bg-white border border-[var(--border)] rounded-xl p-4">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div>
              <div className="font-bold flex items-center gap-2">
                {statusIcon(o.status)} {o.orderId}
              </div>
              <div className="text-sm text-slate-600 mt-1">{o.productTitle}</div>
              <div className="text-xs text-slate-400 mt-1">
                {o.customerName} · {o.customerEmail} · {o.customerPhone}
              </div>
              <div className="text-xs text-slate-400">
                Rs. {o.amount.toLocaleString()} via {o.paymentMethod} · {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>
            {o.status === "pending" && (
              <div className="flex gap-2">
                <button onClick={() => setStatus(o.orderId, "paid")}
                  className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600">
                  Mark Paid
                </button>
                <button onClick={() => setStatus(o.orderId, "cancelled")}
                  className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200">
                  Cancel
                </button>
              </div>
            )}
            {o.status === "paid" && (
              <a href={`/download/${o.downloadToken}`} target="_blank" rel="noreferrer"
                className="text-xs text-[#0ea5e9] font-bold hover:underline flex items-center gap-1">
                <ShoppingBag className="size-3" /> Download Link
              </a>
            )}
          </div>
        </div>
      ))}
      {orders.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <ShoppingBag className="size-12 mx-auto mb-3 opacity-30" />
          <p>No orders yet.</p>
        </div>
      )}
    </div>
  );
}
