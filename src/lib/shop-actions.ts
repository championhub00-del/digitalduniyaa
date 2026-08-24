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
    if ((await Product.countDocuments()) > 0) return;

    await Product.insertMany([
      {
        slug: "ecommerce-starter-kit-pakistan",
        title: "Ecommerce Starter Kit — Pakistan (PDF + Templates)",
        shortDescription: "Complete guide + invoice templates for new Pakistani sellers.",
        description: "<h2>What's Included</h2><ul><li>50-page ecommerce guide</li><li>Invoice templates</li><li>Courier cheat sheet</li></ul>",
        price: 499,
        comparePrice: 999,
        category: "business",
        image: "",
        fileUrl: "https://drive.google.com/",
        fileType: "PDF + ZIP",
        featured: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        slug: "free-shipping-rate-cheatsheet",
        title: "Free Courier Rate Cheatsheet 2026",
        shortDescription: "Free PDF with Leopard, TCS, M&P & BlueEx rate tables.",
        description: "<p>Download our free 2026 courier rate cheatsheet.</p>",
        price: 0,
        comparePrice: 0,
        category: "business",
        image: "",
        fileUrl: "https://drive.google.com/",
        fileType: "PDF",
        featured: true,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  } catch {
    // Non-blocking
  }
}
