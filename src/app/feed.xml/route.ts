import { getBlogsAction } from "@/lib/actions";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const blogs = await getBlogsAction();

  const items = blogs
    .map((blog) => {
      const link = absoluteUrl(`/blog/${blog.slug}`);
      const pubDate = new Date(blog.createdAt).toUTCString();
      const description = escapeXml(blog.metaDescription || blog.title);

      return `<item>
  <title>${escapeXml(blog.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${description}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>en-pk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
