import BgRemoverClient from "@/components/BgRemoverClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Background Remover Online — Remove Image Backgrounds",
  description: "Instantly remove backgrounds from images online for free. Our AI-powered tool runs 100% locally inside your browser. No image uploads, complete privacy, high-definition PNG downloads.",
  keywords: [
    "remove background", "bg remover", "remove bg", "background remover online", 
    "free background remover", "make image transparent", "transparent PNG maker", 
    "AI background remover", "local background removal", "photo background editor"
  ],
  alternates: {
    canonical: "/background-remover",
  },
};

export default function BackgroundRemoverPage() {
  return <BgRemoverClient />;
}
