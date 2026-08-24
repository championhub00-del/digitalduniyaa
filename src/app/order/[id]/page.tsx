import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderAction } from "@/lib/shop-actions";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Status",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderAction(id);
  if (!order) notFound();

  const isPaid = order.status === "paid";

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm text-center space-y-4">
        <div className="text-4xl">{isPaid ? "✅" : order.status === "cancelled" ? "❌" : "⏳"}</div>
        <h1 className="text-xl font-bold text-[#0f172a]">Order {order.orderId}</h1>
        <p className="text-sm text-slate-500">{order.productTitle}</p>

        <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 text-left">
          <p><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
          <p><strong>Amount:</strong> Rs. {order.amount.toLocaleString()}</p>
          <p><strong>Email:</strong> {order.customerEmail}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString("en-PK")}</p>
        </div>

        {isPaid ? (
          <Link
            href={`/download/${order.downloadToken}`}
            className="block w-full py-3 rounded-xl bg-[#0ea5e9] text-white font-bold hover:bg-[#0284c7]"
          >
            Download Product →
          </Link>
        ) : order.status === "pending" ? (
          <p className="text-sm text-slate-500">
            Payment verify hone ke baad download link yahan show hoga.
          </p>
        ) : null}

        <Link href="/shop" className="text-sm text-[#0ea5e9] hover:underline">
          ← Back to Shop
        </Link>
      </div>
    </div>
  );
}
