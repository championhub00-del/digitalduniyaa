import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    const key = process.env.INDEXNOW_KEY?.trim();
    if (!key) return [];
    return [{ source: `/${key}.txt`, destination: "/api/indexnow-key" }];
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/feed.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
    ];
  },
};

export default nextConfig;
