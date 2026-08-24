import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  tags: string[];
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  metaDescription: { type: String, default: "" },
  tags: { type: [String], default: [] },
  image: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// For Next.js hot reloading, check if the model is already compiled
const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
