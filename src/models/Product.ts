import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  shortDescription: { type: String, default: "" },
  description: { type: String, default: "" },
  price: { type: Number, default: 0 },
  comparePrice: { type: Number, default: 0 },
  category: { type: String, default: "general", index: true },
  image: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  fileType: { type: String, default: "digital" },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
