import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service — DigitalDuniya",
  description:
    "Official Terms of Service for DigitalDuniya. Learn about our content ownership policies, acceptable usage, shipping calculator liability disclaimers, and guidelines.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 blog-content">
      <h1>Terms of Service</h1>
      <p><em>Last updated: August 2026</em></p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using DigitalDuniya (accessible at <a href="https://digitalduniya.info">https://digitalduniya.info</a>), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using our services immediately.
      </p>

      <h2>2. Intellectual Property Rights</h2>
      <p>
        All content, layout, designs, calculators, software utilities, graphics, and text on DigitalDuniya are the intellectual property of DigitalDuniya and are protected by international copyright laws. You may not copy, reproduce, republish, distribute, scrape, or modify any material from this site without our explicit prior written consent.
      </p>
      <p>
        You are permitted to share links to our articles or quote short excerpts (under 150 words) provided that clear attribution and a direct link to the original page on DigitalDuniya are included.
      </p>

      <h2>3. Acceptable Use of Calculators & Utilities</h2>
      <p>
        Our tools (including the Shipping Rates Calculator, WebP Image Compressor, PDF Tools, Background Remover, and AI Image Upscaler) are provided strictly for individual or business operational guidance. You agree not to:
      </p>
      <ul>
        <li>Abuse, overload, or attempt to hack our utility servers.</li>
        <li>Automate queries or interface scripts to extract data from our calculators.</li>
        <li>Reverse engineer or decompile any of the client-side libraries used to process tools.</li>
      </ul>

      <h2>4. Limitation of Liability & Warranty Disclaimers</h2>
      <p>
        DigitalDuniya provides all calculators, tools, articles, and services on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, whether express or implied.
      </p>
      <div className="warning-box">
        <strong>Disclaimer on Courier Rates & Calculations:</strong> Shipping rates and calculations (TCS, Leopards, M&P, BlueEx) displayed on this website are estimates based on collected data. Courier rates, fuel surcharges, and COD terms change frequently. Always confirm exact costs directly with your respective courier provider before shipping parcels or making business decisions. DigitalDuniya is not liable for any losses or shipping errors.
      </div>

      <h2>5. Google AdSense & Publisher Policy Guidelines</h2>
      <p>
        DigitalDuniya participates in Google AdSense. We expect our users to interact with our advertisements naturally. Any fraudulent click activity, automated bots, or invalid interactions on ads placed on our site are strictly monitored and reported. We comply fully with Google's Program Policies.
      </p>

      <h2>6. Termination of Access</h2>
      <p>
        We reserve the right to suspend or terminate your access to DigitalDuniya at our sole discretion, without notice, for behavior that we believe violates these Terms of Service, is harmful to other users, or infringes on our operations.
      </p>

      <h2>7. Contact Information</h2>
      <p>
        For legal queries, copyright notices, or questions regarding these terms, please contact us at <a href="mailto:support@digitalduniya.info">support@digitalduniya.info</a>.
      </p>
    </article>
  );
}
