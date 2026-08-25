import ImageUpscalerClient from "@/components/ImageUpscalerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Image Upscaler Online — Enhance Photo Resolution",
  description: "Upscale and enhance image resolution online for free. Increase dimensions by 2x or 4x with details enhancement. Runs 100% locally in your browser sandbox.",
  keywords: [
    "image upscaler", "ai image upscaler", "upscale photo free", "enhance image resolution", 
    "make photo clear", "increase image size online", "convert low res to high res", 
    "free photo enhancer", "local image upscaling", "Pakistan tech tools"
  ],
  alternates: {
    canonical: "/image-upscaler",
  },
};

export default function ImageUpscalerPage() {
  return <ImageUpscalerClient />;
}
