import { PROVINCE } from "./cities";

export type Courier = "Leopard" | "TCS" | "M&P" | "BlueEx";

export interface CalcInput {
  courier: Courier;
  weightKg: number;
  origin: string;
  destination: string;
  cod: number;
}

export interface CalcResult {
  base: number;
  codFee: number;
  fuel: number;
  total: number;
  zone: string;
}

// Multipliers vs Leopard baseline for other couriers (approximations)
const COURIER_MULT: Record<Courier, number> = {
  Leopard: 1,
  TCS: 1.25,
  "M&P": 0.92,
  BlueEx: 1.05,
};

function leopardBase(weightKg: number, origin: string, destination: string): { base: number; zone: string } {
  const w = Math.max(0.5, weightKg);
  const sameCity = origin === destination;
  const sameProvince = PROVINCE[origin] && PROVINCE[origin] === PROVINCE[destination];

  if (sameCity) {
    // 500g = 195, 1kg = 235, extra 500g = 75
    if (w <= 0.5) return { base: 195, zone: "Within City" };
    if (w <= 1) return { base: 235, zone: "Within City" };
    const extraHalves = Math.ceil((w - 1) / 0.5);
    return { base: 235 + extraHalves * 75, zone: "Within City" };
  }
  if (sameProvince) {
    // 1kg = 270, extra kg = 160
    if (w <= 1) return { base: 270, zone: "Same Province" };
    const extra = Math.ceil(w - 1);
    return { base: 270 + extra * 160, zone: "Same Province" };
  }
  // different province
  if (w <= 1) return { base: 350, zone: "Different Province" };
  const extra = Math.ceil(w - 1);
  return { base: 350 + extra * 180, zone: "Different Province" };
}

export function calculate(input: CalcInput): CalcResult {
  const { base, zone } = leopardBase(input.weightKg, input.origin, input.destination);
  const adjustedBase = Math.round(base * COURIER_MULT[input.courier]);
  const codFee = input.cod > 0 ? Math.max(50, Math.round(input.cod * 0.015)) : 0;
  const fuel = Math.round(adjustedBase * 0.16);
  const total = adjustedBase + codFee + fuel;
  return { base: adjustedBase, codFee, fuel, total, zone };
}
