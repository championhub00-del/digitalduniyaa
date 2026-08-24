"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { PK_CITIES } from "@/lib/cities";
import { calculate, type Courier } from "@/lib/calculator";

const COURIER_LIST: Courier[] = ["Leopard", "TCS", "M&P", "BlueEx"];

export default function HomeClient() {
  const [courier, setCourier] = useState<Courier>("Leopard");
  const [weight, setWeight] = useState(1);
  const [origin, setOrigin] = useState("Karachi");
  const [dest, setDest] = useState("Lahore");
  const [result, setResult] = useState<number | null>(null);

  const calc = (e: React.FormEvent) => {
    e.preventDefault();
    const r = calculate({ courier, weightKg: weight, origin, destination: dest, cod: 0 });
    setResult(r.total);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-[var(--border)] p-6 relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-100 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-100 rounded-full opacity-40 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-11 rounded-xl bg-[#0ea5e9] text-white grid place-items-center shadow-md shadow-sky-200">
            <Calculator className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f172a]">Quick Estimate</h3>
            <p className="text-xs text-slate-400">Try our shipping calculator</p>
          </div>
        </div>

        <form onSubmit={calc} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Select courier"
              value={courier}
              onChange={(e) => setCourier(e.target.value as Courier)}
              className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
            >
              {COURIER_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              aria-label="Weight in kg"
              type="number"
              min={0.1}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[#0ea5e9] transition-colors"
              placeholder="kg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Origin city"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
            >
              {PK_CITIES.slice(0, 30).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Destination city"
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:border-[#0ea5e9] transition-colors"
            >
              {PK_CITIES.slice(0, 30).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#f59e0b] text-white font-bold text-sm hover:bg-[#d97f08] transition-colors shadow-md shadow-amber-100"
          >
            Calculate Now
          </button>
          {result !== null && (
            <div className="text-center py-4 bg-[#f0f9ff] rounded-xl border border-[#bae6fd]">
              <div className="text-xs text-slate-400 mb-1">Estimated total</div>
              <div className="text-3xl font-extrabold text-[#0ea5e9]">
                Rs. {result.toLocaleString()}
              </div>
              <Link
                href="/calculator"
                className="text-xs text-[#0ea5e9] hover:underline mt-1 inline-block"
              >
                Full breakdown →
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
