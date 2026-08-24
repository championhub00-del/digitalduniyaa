import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface IOrder extends Document {
  orderId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: string;
  downloadToken: string;
  createdAt: Date;
  paidAt?: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  productId: { type: String, required: true },
  productSlug: { type: String, required: true },
  productTitle: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true, index: true },
  customerPhone: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending", index: true },
  paymentMethod: { type: String, default: "jazzcash" },
  downloadToken: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
