import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us — DigitalDuniya Pakistan",
  description:
    "Get in touch with DigitalDuniya. Contact us for partnerships, article submissions, feedback, or any queries about Pakistan ecommerce and digital tools.",
  path: "/contact",
  keywords: [
    "contact DigitalDuniya",
    "Pakistan ecommerce help",
    "digital resource Pakistan",
    "write for us Pakistan",
  ],
});

export default function ContactPage() {
  return <ContactForm />;
}
