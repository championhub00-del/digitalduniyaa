import CalculatorClient from "@/components/CalculatorClient";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { getSettingsAction } from "@/lib/actions";
import { calculatorJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Pakistan Shipping Calculator — Leopard, TCS, M&P, BlueEx",
  description:
    "Free Pakistan shipping calculator. Compare Leopard, TCS, M&P, and BlueEx rates including COD and fuel surcharge instantly.",
  path: "/calculator",
});

export default async function CalculatorPage() {
  const settings = await getSettingsAction();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <JsonLd data={calculatorJsonLd()} />
      <header className="text-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] text-xs font-bold mb-4 uppercase tracking-wider">
          🆓 Free Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-3">
          Pakistan Shipping Calculator
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Estimate courier charges across Leopard, TCS, M&amp;P, and BlueEx — including COD and fuel surcharge.
        </p>
      </header>
      <div className="max-w-5xl mx-auto">
        <AdSlot size="728x90" label="Calculator Header Ad" adsenseId={settings.adsenseId} />
      </div>
      <CalculatorClient adsenseId={settings.adsenseId} />
    </div>
  );
}
