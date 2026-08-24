import { getSettingsAction } from "@/lib/actions";
import { getProductsAction, seedProductsIfEmpty } from "@/lib/shop-actions";
import ShopClient from "@/components/ShopClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Digital Products Shop — Templates, Guides & Tools for Pakistan",
  description:
    "Buy and download digital products for Pakistani entrepreneurs — ecommerce templates, guides, cheat sheets, and business tools. JazzCash & EasyPaisa accepted.",
  path: "/shop",
  keywords: [
    "digital products Pakistan",
    "ecommerce templates Pakistan",
    "online business guides",
    "DigitalDuniya shop",
    "downloadable resources Pakistan",
  ],
});

export default async function ShopPage() {
  await seedProductsIfEmpty();
  const [products, settings] = await Promise.all([
    getProductsAction(),
    getSettingsAction(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f172a] mb-2">
          Digital Products Shop
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl">
          Premium templates, guides, and tools for Pakistani ecommerce sellers. Pay via JazzCash, EasyPaisa, or bank transfer.
        </p>
      </header>

      <ShopClient products={JSON.parse(JSON.stringify(products))} />

      <div className="mt-12 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-2xl p-6 sm:p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Need a Custom Product?</h2>
        <p className="text-sm opacity-90 mb-4">
          Contact us on WhatsApp for custom templates, bulk orders, or reseller deals.
        </p>
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block px-6 py-3 bg-white text-[#0ea5e9] font-bold rounded-xl hover:bg-slate-100 transition-colors"
        >
          WhatsApp Us →
        </a>
      </div>
    </div>
  );
}
