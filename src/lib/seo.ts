import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://digitalduniya.info";

export const SITE_NAME = "DigitalDuniya";
export const SITE_TAGLINE = "Pakistan's #1 Ecommerce & Shipping Resource";
export const DEFAULT_DESCRIPTION =
  "Compare Leopard, TCS, M&P and BlueEx courier rates instantly. Free shipping calculator, ecommerce guides, tech, health, and lifestyle content for Pakistan.";
export const DEFAULT_OG_IMAGE = "/opengraph-image";
export const TWITTER_HANDLE = "@digitalduniyaa";
export const GOOGLE_SITE_VERIFICATION = "VJejj7reIcd0mDSKEBtoji8V3TPr6yJOxDFRW8HAqRg";

export function absoluteUrl(path = "/") {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  keywords,
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: keywords ?? [],
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type,
      locale: "en_PK",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: ogTitle }],
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime || publishedTime, tags }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [absoluteUrl(image)],
      site: TWITTER_HANDLE,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-PK",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.ico`,
        },
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "hello@digitalduniya.info",
          areaServed: "PK",
          availableLanguage: ["en", "ur"],
        },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingJsonLd(blog: {
  slug: string;
  title: string;
  metaDescription: string;
  image: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
}) {
  const url = absoluteUrl(`/blog/${blog.slug}`);
  const image = blog.image || absoluteUrl(DEFAULT_OG_IMAGE);
  const modified = blog.updatedAt || blog.createdAt;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: blog.title,
    description: blog.metaDescription,
    image: [image.startsWith("http") ? image : absoluteUrl(image)],
    datePublished: new Date(blog.createdAt).toISOString(),
    dateModified: new Date(modified).toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
    keywords: blog.tags.join(", "),
    inLanguage: "en-PK",
    url,
  };
}

export function productJsonLd(product: {
  slug: string;
  title: string;
  shortDescription: string;
  price: number;
  image: string;
  category: string;
}) {
  const url = absoluteUrl(`/shop/${product.slug}`);
  const image = product.image || absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: image.startsWith("http") ? image : absoluteUrl(image),
    url,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url,
    },
    brand: { "@type": "Brand", name: SITE_NAME },
  };
}

export function calculatorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pakistan Shipping Calculator",
    url: absoluteUrl("/calculator"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
    description:
      "Free shipping calculator for Leopard, TCS, M&P, and BlueEx couriers in Pakistan including COD and fuel surcharge.",
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}
