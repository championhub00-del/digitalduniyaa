import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "Terms of use for DigitalDuniya — content ownership, liability, AdSense compliance, and acceptable use.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 blog-content">
      <h1>Terms of Service</h1>
      <p><em>Last updated: June 2026</em></p>
      <h2>Acceptance</h2>
      <p>By accessing or using DigitalDuniya, you agree to these Terms of Service. If you do not agree, please stop using the site immediately.</p>
      <h2>Content Ownership</h2>
      <p>All articles, tools, calculators, images, and original content on DigitalDuniya are &copy; DigitalDuniya. You may share short excerpts (up to 150 words) with a link back to the original article. Full republication without written permission is strictly prohibited.</p>
      <h2>No Liability</h2>
      <p>Shipping rates, courier policies, and all information provided on this site are for guidance only. Always confirm exact rates directly with the courier before shipping. DigitalDuniya is not liable for any financial losses arising from use of this information.</p>
      <div className="warning-box">
        <strong>Important:</strong> Courier rates change frequently. Always verify current rates on the official courier website before making business decisions.
      </div>
      <h2>Google AdSense Policy Compliance</h2>
      <p>This site participates in Google AdSense. We strictly comply with Google&apos;s Publisher Policies. Clicking your own ads or encouraging others to click ads is strictly prohibited and may result in account termination. We do not engage in invalid click activity.</p>
      <h2>Comments</h2>
      <p>By posting a comment on DigitalDuniya, you grant us a non-exclusive right to display your comment. We reserve the right to remove any comment that is spam, abusive, off-topic, or violates any law.</p>
      <h2>Acceptable Use</h2>
      <p>You agree not to: scrape this site at scale, attempt to hack or exploit any vulnerability, post unlawful content, or use this site for any illegal purpose.</p>
      <h2>Third-Party Links</h2>
      <p>DigitalDuniya may link to external websites. We are not responsible for the content or privacy practices of those sites.</p>
      <h2>Changes</h2>
      <p>We may update these terms at any time. Continued use of the site after changes means acceptance of the new terms.</p>
      <h2>Contact</h2>
      <p>For legal queries, email <a href="mailto:hello@digitalduniya.info">hello@digitalduniya.info</a>.</p>
    </article>
  );
}
