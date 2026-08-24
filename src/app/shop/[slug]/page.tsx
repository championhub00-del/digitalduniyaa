import { notFound } from "next/navigation";
import Link from "next/link";
import { getSettingsAction } from "@/lib/actions";
import { getProductAction, getProductsAction } from "@/lib/shop-actions";
import ProductCheckout from "@/components/ProductCheckout";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProductsAction();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductAction(slug);
  if (!product) return { title: "Product Not Found", robots: { index: false, follow: false } };

  const ogImage =
    product.image ||
    `https://image.pollinations.ai/prompt/${encodeURIComponent(
      product.title + ", digital product, professional mockup"
    )}?width=1200&height=630&nologo=true`;

  return pageMetadata({
    title: product.title,
    description: product.shortDescription,
    path: `/shop/${slug}`,
    image: ogImage,
    keywords: [product.category, "digital product Pakistan", product.title],
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings, allProducts] = await Promise.all([
    getProductAction(slug),
    getSettingsAction(),
    getProductsAction(),
  ]);

  if (!product) notFound();

  const related = allProducts.filter((p) => p.slug !== slug).slice(0, 3);
  const image =
    product.image ||
    `https://image.pollinations.ai/prompt/${encodeURIComponent(
      product.title + ", digital product mockup, premium"
    )}?width=800&height=450&nologo=true&seed=${product._id}`;

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: product.title, path: `/shop/${slug}` },
          ]),
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#0ea5e9]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#0ea5e9]">Shop</Link>
          <span>/</span>
          <span className="text-slate-600 line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-white shadow-sm">
              <img src={image} alt={product.title} className="w-full aspect-video object-cover" />
            </div>
            <div className="mt-6 bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0ea5e9]">
                {product.fileType} · {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mt-2 mb-3">{product.title}</h1>
              <p className="text-slate-500">{product.shortDescription}</p>
              <div className="mt-4 flex items-baseline gap-3">
                {product.price <= 0 ? (
                  <span className="text-3xl font-extrabold text-emerald-600">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-[#0f172a]">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.comparePrice > product.price && (
                      <span className="text-lg text-slate-400 line-through">
                        Rs. {product.comparePrice.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <ProductCheckout product={JSON.parse(JSON.stringify(product))} settings={settings} />

            <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-4 text-sm text-[#0c4a6e] space-y-1">
              <p>✓ Instant download for free products</p>
              <p>✓ JazzCash / EasyPaisa / Bank transfer</p>
              <p>✓ WhatsApp support included</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">Related Products</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r._id}
                  href={`/shop/${r.slug}`}
                  className="bg-white rounded-xl border border-[var(--border)] p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-sm line-clamp-2 hover:text-[#0ea5e9]">{r.title}</h3>
                  <p className="text-[#0ea5e9] font-bold text-sm mt-2">
                    {r.price <= 0 ? "Free" : `Rs. ${r.price.toLocaleString()}`}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
