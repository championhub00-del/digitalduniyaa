import { revalidatePath } from "next/cache";
import { absoluteUrl, SITE_URL } from "./seo";

/** Ping IndexNow (Bing/Yandex) and Google sitemap after content changes. */
export async function notifySearchEngines(paths: string[]) {
  const urls = paths.map((p) => absoluteUrl(p.startsWith("/") ? p : `/${p}`));

  const indexNowKey = process.env.INDEXNOW_KEY?.trim();
  if (indexNowKey && urls.length > 0) {
    try {
      await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: new URL(SITE_URL).hostname,
          key: indexNowKey,
          keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
          urlList: urls.slice(0, 100),
        }),
      });
    } catch {
      // Non-blocking — indexing notification is best-effort
    }
  }

  try {
    await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`,
      { method: "GET" }
    );
  } catch {
    // Non-blocking
  }
}

/** Revalidate cached pages and notify search engines for a blog post. */
export async function revalidateBlog(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  await notifySearchEngines(["/", "/blog", `/blog/${slug}`]);
}

/** Revalidate cached pages and notify search engines for a product. */
export async function revalidateProduct(slug: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  if (slug) revalidatePath(`/shop/${slug}`);
  revalidatePath("/sitemap.xml");
  const paths = ["/", "/shop", ...(slug ? [`/shop/${slug}`] : [])];
  await notifySearchEngines(paths);
}
