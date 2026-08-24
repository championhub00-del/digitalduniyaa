import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How DigitalDuniya handles your data, uses Google AdSense cookies, and protects your privacy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 blog-content">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: June 2026</em></p>
      <h2>Overview</h2>
      <p>DigitalDuniya (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This policy explains what information we collect, how it&apos;s used, and your rights as a visitor.</p>
      <h2>Information We Collect</h2>
      <p>We collect minimal personal data. When you subscribe to our newsletter, your email address is stored securely in our database. When you post a comment, your name and comment text are stored. No passwords or payment data are ever collected from readers.</p>
      <h2>Google AdSense</h2>
      <p>We use Google AdSense to display advertisements. Google and its partners may use cookies to serve ads based on your prior visits to this and other websites. These are third-party cookies and are governed by Google&apos;s Privacy Policy. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Google Ads Settings</a>.</p>
      <div className="highlight-box">
        <strong>AdSense Compliance:</strong> We fully comply with Google AdSense program policies. We do not click our own ads, encourage visitors to click ads, or use any deceptive methods to generate ad revenue.
      </div>
      <h2>Cookies</h2>
      <p>Our site uses cookies for essential functionality (admin sessions) and for Google AdSense advertising. By using this site, you consent to our use of cookies as described in this policy.</p>
      <h2>Third-Party Services</h2>
      <p>We use Pollinations AI for image generation, Groq AI for content generation, and Google services for analytics and advertising. Each service has its own privacy policy. Embedded YouTube videos may also set their own cookies.</p>
      <h2>Data Retention</h2>
      <p>Newsletter emails and comments are retained until you request deletion. You may contact us at any time to have your data removed.</p>
      <h2>Children&apos;s Privacy</h2>
      <p>DigitalDuniya is not directed to children under 13. We do not knowingly collect personal information from children.</p>
      <h2>Contact</h2>
      <p>Questions about privacy? Email <a href="mailto:hello@digitalduniya.info">hello@digitalduniya.info</a>.</p>
    </article>
  );
}
