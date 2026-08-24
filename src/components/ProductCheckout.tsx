"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createOrderAction } from "@/lib/shop-actions";
import type { ProductData } from "@/lib/shop-actions";
import type { SettingsData } from "@/lib/actions";

export default function ProductCheckout({
  product,
  settings,
}: {
  product: ProductData;
  settings: SettingsData;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("jazzcash");
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [downloadToken, setDownloadToken] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [pending, startTransition] = useTransition();

  const isPaid = product.price > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createOrderAction({
        productSlug: product.slug,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        paymentMethod: method,
      });
      if (!res.success || !res.order) {
        setError(res.error || "Order failed");
        return;
      }
      setOrderId(res.order.orderId);
      setDownloadToken(res.order.downloadToken);
      setIsFree(!!res.isFree);
    });
  };

  if (orderId) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{isFree || !isPaid ? "✅" : "⏳"}</div>
          <h2 className="text-xl font-bold text-[#0f172a]">
            {isFree || !isPaid ? "Order Confirmed!" : "Order Placed — Awaiting Payment"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Order ID: <strong className="text-[#0f172a]">{orderId}</strong>
          </p>
        </div>

        {isPaid && !isFree && (
          <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-4 text-sm space-y-3">
            <p className="font-bold text-[#0c4a6e]">
              Send Rs. {product.price.toLocaleString()} via {method === "jazzcash" ? "JazzCash" : method === "easypaisa" ? "EasyPaisa" : "Bank Transfer"}
            </p>
            {method === "jazzcash" && settings.jazzcashNumber && (
              <p>JazzCash: <strong>{settings.jazzcashNumber}</strong></p>
            )}
            {method === "easypaisa" && settings.easypaisaNumber && (
              <p>EasyPaisa: <strong>{settings.easypaisaNumber}</strong></p>
            )}
            {method === "bank" && settings.bankAccount && (
              <div>
                <p>{settings.bankName} — {settings.bankTitle}</p>
                <p>Account: <strong>{settings.bankAccount}</strong></p>
              </div>
            )}
            <p className="text-slate-600">
              Reference mein apna Order ID likhein: <strong>{orderId}</strong>
            </p>
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Hi, I paid for order ${orderId} — ${product.title}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block w-full text-center py-2.5 rounded-xl bg-[#25D366] text-white font-bold hover:opacity-90"
            >
              WhatsApp Payment Proof Bhejein
            </a>
            <p className="text-xs text-slate-500">
              Payment verify hone ke baad download link activate ho jayega (usually 1-2 hours).
            </p>
          </div>
        )}

        {(isFree || !isPaid) && downloadToken && (
          <Link
            href={`/download/${downloadToken}`}
            className="block w-full text-center py-3 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7]"
          >
            Download Now →
          </Link>
        )}

        <Link href={`/order/${orderId}`} className="block text-center text-sm text-[#0ea5e9] hover:underline">
          Order status check karein
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-[#0f172a]">
        {isPaid ? "Buy Now" : "Get Free Download"}
      </h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
      )}

      <input
        required
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]"
      />
      <input
        required
        placeholder="WhatsApp / Phone (03xx...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9]"
      />

      {isPaid && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#0f172a]">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "jazzcash", label: "JazzCash" },
              { id: "easypaisa", label: "EasyPaisa" },
              { id: "bank", label: "Bank" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`py-2 rounded-lg text-xs font-bold border-2 transition-colors ${
                  method === m.id
                    ? "border-[#0ea5e9] bg-[#e0f2fe] text-[#0c4a6e]"
                    : "border-[var(--border)] text-slate-600"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 rounded-xl bg-[#f59e0b] text-white font-bold hover:bg-[#d97f08] disabled:opacity-60 transition-colors"
      >
        {pending
          ? "Processing..."
          : isPaid
            ? `Pay Rs. ${product.price.toLocaleString()}`
            : "Get Free Download"}
      </button>

      <p className="text-xs text-slate-400 text-center">
        🔒 Secure checkout · Instant delivery for free products
      </p>
    </form>
  );
}
