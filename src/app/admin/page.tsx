import AdminClient from "@/components/AdminClient";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Package, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Admin Dashboard",
  description: "DigitalDuniya admin control panel.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-3 mb-2">
          <Link href="/admin/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9] text-white text-sm font-bold hover:bg-[#0284c7] shadow-sm">
            <Package className="size-4" /> Shop & Products
          </Link>
          <Link href="/admin/payments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f59e0b] text-white text-sm font-bold hover:bg-[#d97f08] shadow-sm">
            <CreditCard className="size-4" /> Payment Settings
          </Link>
        </div>
      </div>
      <AdminClient />
    </div>
  );
}
