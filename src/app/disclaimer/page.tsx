import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer — DigitalDuniya",
  description:
    "Official Disclaimer of DigitalDuniya. Read about our courier rates estimation disclaimers, financial/business advice limits, and accuracy warnings.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-14 blog-content">
      <h1>Disclaimer</h1>
      <p><em>Last updated: August 2026</em></p>
      
      <p>
        The information provided on DigitalDuniya (accessible at <a href="https://digitalduniya.info">https://digitalduniya.info</a>) is for general informational and educational purposes only.
      </p>

      <h2>1. Accuracy of Shipping Rates & Calculators</h2>
      <p>
        All calculator tools, shipping rate estimates, fuel surcharges, and cash-on-delivery (COD) calculations provided on DigitalDuniya are compiled from publicly available rates and user inputs. While we make every effort to keep these rates up to date, courier companies in Pakistan (including TCS, Leopards Courier, M&P, and BlueEx) change their rates, terms, and fuel adjustments frequently without public notice.
      </p>
      <div className="warning-box">
        <strong>Important Warning:</strong> DigitalDuniya does NOT guarantee the accuracy, completeness, or reliability of any rate calculations displayed. Always consult your courier account manager or check the official rate cards of the respective courier company before quoting shipping costs to customers or booking parcels. We are not responsible for any financial discrepancy.
      </div>

      <h2>2. Professional Advice Disclaimer</h2>
      <p>
        The digital business guides, dropshipping tutorials, tax filing tips, and tech reviews published on our blog do not constitute professional financial, legal, or tax advice. All actions you take based on the information found on this website are strictly at your own risk. DigitalDuniya will not be liable for any losses and/or damages in connection with the use of our website.
      </p>

      <h2>3. External Links Disclaimer</h2>
      <p>
        DigitalDuniya may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
      </p>

      <h2>4. Consent</h2>
      <p>
        By using our website, you hereby consent to our disclaimer and agree to its terms.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        Should you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <a href="mailto:support@digitalduniya.info">support@digitalduniya.info</a>.
      </p>
    </article>
  );
}
