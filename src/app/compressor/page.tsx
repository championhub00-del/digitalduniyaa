import ImageCompressorClient from "@/components/ImageCompressorClient";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { getSettingsAction } from "@/lib/actions";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Free Image Size Compressor — Optimize JPG, PNG & WebP Online",
  description:
    "Compress, resize, and convert JPEG, PNG, and WebP images online for free. 100% private client-side image optimization with instant preview and download.",
  path: "/compressor",
});

export default async function CompressorPage() {
  const settings = await getSettingsAction();
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free Image Size Compressor",
    "url": "https://digitalduniya.info/compressor",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Compress, resize, and convert JPEG, PNG, and WebP images online for free. 100% private client-side image optimization with instant preview."
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <JsonLd data={schemaData} />
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold mb-4 uppercase tracking-wider">
          🆓 Free Utility Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3">
          Free Image Size Compressor
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
          Reduce your image file size by up to 80% without losing quality. Process JPG, PNG, and WebP images securely right inside your browser.
        </p>
      </header>

      <ImageCompressorClient adsenseId={settings.adsenseId} />
    </div>
  );
}
