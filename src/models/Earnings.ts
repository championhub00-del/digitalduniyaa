import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEarnings extends Document {
  month: string;
  adsense: number;
  meta: number;
}

const EarningsSchema: Schema = new Schema({
  month: { type: String, required: true, unique: true, index: true },
  adsense: { type: Number, default: 0 },
  meta: { type: Number, default: 0 },
});

const Earnings: Model<IEarnings> = mongoose.models.Earnings || mongoose.model<IEarnings>("Earnings", EarningsSchema);

export default Earnings;
