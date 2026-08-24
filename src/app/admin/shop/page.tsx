"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductsTab, OrdersTab } from "@/components/AdminShop";
import { Package, ShoppingBag, ArrowLeft } from "lucide-react";
import { checkAdminAction } from "@/lib/actions";

export default function AdminShopPage() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [toast, setToast] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAction().then((res) => {
      if (res.isAdmin) {
        setAuthed(true);
      } else {
        window.location.href = "/admin";
      }
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="size-8 border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 rounded-lg border hover:bg-gray-50">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Shop Management</h1>
          <p className="text-sm text-slate-400">Digital products & orders</p>
        </div>
      </div>

      <div className="flex gap-1 mb-7 bg-[#f1f5f9] rounded-xl p-1 w-fit">
        <button onClick={() => setTab("products")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${tab === "products" ? "bg-white text-[#0ea5e9] shadow-sm" : "text-slate-500"}`}>
          <Package className="size-4" /> Products
        </button>
        <button onClick={() => setTab("orders")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${tab === "orders" ? "bg-white text-[#0ea5e9] shadow-sm" : "text-slate-500"}`}>
          <ShoppingBag className="size-4" /> Orders
        </button>
      </div>

      {tab === "products" && <ProductsTab onToast={showToast} />}
      {tab === "orders" && <OrdersTab onToast={showToast} />}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
