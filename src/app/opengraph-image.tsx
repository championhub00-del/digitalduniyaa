import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DigitalDuniya — Pakistan Ecommerce & Shipping Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0ea5e9 100%)",
          color: "white",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.9, marginBottom: 16 }}>🇵🇰 Pakistan&apos;s #1 Digital Resource</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          DigitalDuniya
        </div>
        <div style={{ fontSize: 34, marginTop: 24, opacity: 0.92, maxWidth: 820, lineHeight: 1.35 }}>
          Free shipping calculator, courier guides, and premium blogs for Pakistani sellers.
        </div>
      </div>
    ),
    { ...size }
  );
}
