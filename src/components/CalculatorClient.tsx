"use client";

import { useState } from "react";
import { PK_CITIES } from "@/lib/cities";
import { calculate, type Courier, type CalcResult } from "@/lib/calculator";
import AdSlot from "@/components/AdSlot";
import { Calculator as CalcIcon, Truck, Package, Zap } from "lucide-react";

const COURIERS: { id: Courier; emoji: string; desc: string }[] = [
  { id: "Leopard", emoji: "🐆", desc: "Best balance" },
  { id: "TCS", emoji: "📦", desc: "Premium fast" },
  { id: "M&P", emoji: "🚚", desc: "Budget option" },
  { id: "BlueEx", emoji: "🔵", desc: "Growing network" },
];

interface Props { adsenseId?: string }

export default function CalculatorClient({ adsenseId }: Props) {
  const [courier, setCourier] = useState<Courier>("Leopard");
  const [weight, setWeight] = useState("1");
  const [origin, setOrigin] = useState("Karachi");
  const [destination, setDestination] = useState("Lahore");
  const [cod, setCod] = useState("0");
  const [result, setResult] = useState<CalcResult | null>(null);

  const onCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const r = calculate({
      courier,
      weightKg: parseFloat(weight) || 0,
      origin,
      destination,
      cod: parseFloat(cod) || 0,
    });
    setResult(r);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-8">
      {/* Form */}
      <form onSubmit={onCalculate} className="bg-white rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm space-y-6">
        {/* Courier selector */}
        <div>
          <label className="text-sm font-semibold text-[#0f172a] block mb-3">Select Courier</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {COURIERS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCourier(c.id)}
                className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                  courier === c.id
                    ? "bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-md shadow-sky-200"
                    : "bg-white border-[var(--border)] text-[#1e293b] hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span>{c.id}</span>
                <span className={`text-[10px] font-normal ${courier === c.id ? "text-white/80" : "text-slate-400"}`}>
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Weight & COD */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#0f172a] block mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
              placeholder="e.g. 1.5"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#0f172a] block mb-2">COD Amount (Rs)</label>
            <input
              type="number"
              min="0"
              value={cod}
              onChange={(e) => setCod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[#0ea5e9] transition-colors"
              placeholder="0 if not COD"
            />
          </div>
        </div>

        {/* Cities */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-[#0f172a] block mb-2">Origin City</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
            >
              {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-[#0f172a] block mb-2">Destination City</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-xl text-sm bg-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
            >
              {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white font-bold text-base hover:opacity-90 transition-opacity shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
        >
          <CalcIcon className="size-5" /> Calculate Shipping Cost
        </button>
      </form>

      {/* Results + Sidebar */}
      <div className="space-y-5">
        {result ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#0ea5e9] bg-[#e0f2fe] px-2.5 py-1 rounded-full uppercase">
                {courier}
              </span>
              <span className="text-xs text-slate-400">{result.zone}</span>
            </div>
            <h3 className="font-bold text-[#0f172a] mb-5 mt-2">Cost Breakdown</h3>

            <div className="space-y-3 mb-5">
              <Row icon={<Package className="size-4" />} label="Base charge" value={result.base} />
              <Row icon={<Zap className="size-4" />} label="COD fee (1.5%)" value={result.codFee} />
              <Row icon={<Truck className="size-4" />} label="Fuel surcharge (16%)" value={result.fuel} />
            </div>

            <div className="border-t-2 border-dashed border-[var(--border)] pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0f172a]">Total Estimate</span>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[#0ea5e9]">
                    Rs. {result.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">incl. all charges</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#f8fafc] border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center">
            <CalcIcon className="size-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm font-medium">Fill the form and click Calculate</p>
            <p className="text-slate-300 text-xs mt-1">Results appear here instantly</p>
          </div>
        )}

        <AdSlot size="300x250" label="Calculator Sidebar Ad" adsenseId={adsenseId} />

        {/* Rate info card */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
          <h3 className="font-bold text-[#0f172a] mb-3 text-sm">📊 How Rates Are Calculated</h3>
          <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
            <li>• Within city: 500g=Rs.195, 1kg=Rs.235, +Rs.75/500g</li>
            <li>• Same province: 1kg=Rs.270, +Rs.160/extra kg</li>
            <li>• Diff province: 1kg=Rs.350, +Rs.180/extra kg</li>
            <li>• COD fee: 1.5% (min Rs.50)</li>
            <li>• Fuel surcharge: 16% on base</li>
            <li>• TCS ≈ +25% | M&amp;P ≈ −8% | BlueEx ≈ +5%</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-[#f8fafc] transition-colors">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-[#0ea5e9]">{icon}</span>
        {label}
      </div>
      <span className="font-semibold text-[#0f172a] text-sm">Rs. {value.toLocaleString()}</span>
    </div>
  );
}
