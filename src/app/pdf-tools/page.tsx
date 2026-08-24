import PdfToolsClient from "@/components/PdfToolsClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Premium Online PDF Tools — Merge, Split, Protect & Watermark PDFs",
  description:
    "Free premium PDF utilities suite. Combine, separate, rotate, protect with passwords, or watermark your PDFs instantly. 100% private, runs entirely inside your browser.",
  path: "/pdf-tools",
  keywords: [
    "free PDF tools Pakistan",
    "merge PDF online",
    "split PDF pages",
    "add password to PDF",
    "watermark PDF document",
    "convert images to PDF",
    "client-side PDF utility",
  ],
});

export default function PdfToolsPage() {
  return <PdfToolsClient />;
}
