"use server";

import { connectToDatabase } from "./db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { cookies } from "next/headers";
import { slugify } from "./utils";
import { revalidateProduct } from "./indexing";
import crypto from "crypto";

export type ProductData = {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice: number;
  category: string;
  image: string;
  fileUrl: string;
  fileType: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderData = {
  _id: string;
  orderId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  status: "pending" | "paid" | "cancelled";
  paymentMethod: string;
  downloadToken: string;
  createdAt: string;
  paidAt?: string;
};

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("dd_admin")?.value === "1";
}

function generateOrderId() {
  return `DD-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function getProductsAction(publishedOnly = true): Promise<ProductData[]> {
  try {
    await connectToDatabase();
    const filter = publishedOnly ? { published: true } : {};
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch {
    return [];
  }
}

export async function getProductAction(slug: string): Promise<ProductData | null> {
  try {
    await connectToDatabase();
    const product = await Product.findOne({ slug, published: true }).lean();
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch {
    return null;
  }
}

export async function saveProductAction(data: {
  _id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice: number;
  category: string;
  image: string;
  fileUrl: string;
  fileType: string;
  featured: boolean;
  published: boolean;
}) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  try {
    await connectToDatabase();
    const { _id, ...rest } = data;
    const slug = rest.slug || slugify(rest.title);
    const payload = { ...rest, slug, updatedAt: new Date() };

    if (_id?.trim()) {
      await Product.findByIdAndUpdate(_id, payload);
    } else {
      await Product.create({ ...payload, createdAt: new Date() });
    }

    await revalidateProduct(slug);
    return { success: true, slug };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteProductAction(id: string) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  try {
    await connectToDatabase();
    await Product.findByIdAndDelete(id);
    await revalidateProduct("");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createOrderAction(data: {
  productSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
}) {
  try {
    await connectToDatabase();
    const product = await Product.findOne({ slug: data.productSlug, published: true }).lean();
    if (!product) return { success: false, error: "Product not found" };

    const orderId = generateOrderId();
    const downloadToken = generateToken();
    const isFree = product.price <= 0;

    const order = await Order.create({
      orderId,
      productId: String(product._id),
      productSlug: product.slug,
      productTitle: product.title,
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      customerPhone: data.customerPhone.trim(),
      amount: product.price,
      status: isFree ? "paid" : "pending",
      paymentMethod: data.paymentMethod,
      downloadToken,
      paidAt: isFree ? new Date() : undefined,
    });

    return {
      success: true,
      order: JSON.parse(JSON.stringify(order)) as OrderData,
      isFree,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getOrderAction(orderId: string): Promise<OrderData | null> {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ orderId }).lean();
    return order ? JSON.parse(JSON.stringify(order)) : null;
  } catch {
    return null;
  }
}

export async function getAllOrdersAction(): Promise<OrderData[]> {
  if (!(await isAdmin())) return [];
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(orders));
  } catch {
    return [];
  }
}

export async function updateOrderStatusAction(orderId: string, status: "pending" | "paid" | "cancelled") {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
  try {
    await connectToDatabase();
    const update: { status: string; paidAt?: Date } = { status };
    if (status === "paid") update.paidAt = new Date();
    await Order.findOneAndUpdate({ orderId }, update);
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getDownloadUrlAction(token: string) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ downloadToken: token }).lean();
    if (!order || order.status !== "paid") {
      return { success: false, error: "Invalid or unpaid order" };
    }
    const product = await Product.findById(order.productId).lean();
    if (!product?.fileUrl) {
      return { success: false, error: "Download file not configured" };
    }
    return { success: true, fileUrl: product.fileUrl, productTitle: product.title };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function seedProductsIfEmpty() {
  try {
    await connectToDatabase();
    
    // Check if the new products are already seeded, if so, skip to avoid double seeding
    const exists = await Product.findOne({ slug: "pakistani-ecommerce-dropshipping-master-toolkit" });
    if (exists) return;

    // Clear old placeholder seed data
    await Product.deleteMany({
      slug: { $in: ["ecommerce-starter-kit-pakistan", "free-shipping-rate-cheatsheet"] }
    });

    await Product.insertMany([
      {
        slug: "pakistani-ecommerce-dropshipping-master-toolkit",
        title: "Pakistani E-Commerce & Dropshipping Master Toolkit",
        shortDescription: "Verified supplier directory (Karachi/Lahore/Faisalabad), COD rate calculators, product research sheets, and Meta Ads copies.",
        description: "<h2>What's Inside the Master Toolkit</h2><p>This toolkit is compiled specifically for Pakistani dropshippers, ecommerce brand owners, and local resellers to streamline sourcing and shipping operations.</p><ul><li><strong>Verified Supplier Directory:</strong> Active WhatsApp & shop details of wholesale vendors in Shah Alam Market (Lahore), Faisalabad Cloth Markets, and Karachi Sourcing Hubs.</li><li><strong>COD Profit Margin Sheet:</strong> Automated Excel calculator including return ratios for TCS, Leopards Courier, and BlueEx to calculate exact margins.</li><li><strong>Winning Product Sheet:</strong> Hot trending local sourcing product lists with pricing thresholds.</li><li><strong>Meta Ads Copy Templates:</strong> Ready-to-use Facebook, Instagram, and TikTok script templates designed for maximum CTR.</li></ul>",
        price: 1499,
        comparePrice: 3500,
        category: "business",
        image: "",
        fileUrl: "https://drive.google.com/file/d/1_e-com-toolkit/view",
        fileType: "ZIP File",
        featured: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: "500-ecommerce-canva-ad-social-media-templates",
        title: "500+ E-Commerce Canva Ad & Social Media Templates",
        shortDescription: "High-converting TikTok/Reels video templates, product banners, sale graphics, and social posts editable in Canva.",
        description: "<h2>What's Included</h2><p>Transform your brand's social presence with 500+ high-engagement, copy-paste templates editable inside Canva Free or Pro.</p><ul><li><strong>TikTok & Reels Frames:</strong> Viral layouts and video hook placeholders optimized for ecommerce sales.</li><li><strong>Product Showcase Posts:</strong> Clean layouts for Instagram feed and stories.</li><li><strong>Promo Banners:</strong> Eid collection sales, Mid-summer discounts, Black Friday, and general promotional graphics.</li><li><strong>Customer Review Templates:</strong> Showcase reviews beautifully to boost conversions.</li></ul>",
        price: 999,
        comparePrice: 2500,
        category: "templates",
        image: "",
        fileUrl: "https://drive.google.com/file/d/2_canva-templates/view",
        fileType: "Canva Links",
        featured: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: "freelancer-agency-business-suite",
        title: "Freelancer & Agency Business Suite",
        shortDescription: "Tax filing sheet for Pakistani freelancers (FBR guide), automated invoice generator, and proposal templates.",
        description: "<h2>What's Included</h2><p>A comprehensive business operational bundle for Pakistani freelancers, designers, developers, and agency owners to manage clients professionally.</p><ul><li><strong>Freelancer Tax Guide:</strong> Simple walkthrough for FBR filer registration and taxation guidelines in Pakistan.</li><li><strong>Invoice Generator:</strong> Automated spreadsheets to generate client bills in PKR, USD, and AED.</li><li><strong>Proposal Templates:</strong> Highly professional proposals to pitch client projects in web dev, SEO, social media, and design.</li><li><strong>Contract Agreements:</strong> Sample contract templates protect your freelance work payments.</li></ul>",
        price: 1299,
        comparePrice: 2999,
        category: "tools",
        image: "",
        fileUrl: "https://drive.google.com/file/d/3_agency-suite/view",
        fileType: "ZIP + Excel",
        featured: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  } catch (err) {
    console.error("[shop-actions.ts] seedProductsIfEmpty failed:", err);
  }
}
