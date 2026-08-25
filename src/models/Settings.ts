import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  key: string;
  siteLogo: string;
  adsenseId: string;
  groqKey: string;
  geminiKey: string;
  youtubeKey: string;
  jazzcashNumber: string;
  easypaisaNumber: string;
  bankName: string;
  bankAccount: string;
  bankTitle: string;
  whatsappNumber: string;
  lastSiteAuditRecommendations: string;
}

const SettingsSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: "site_settings" },
  siteLogo: { type: String, default: "" },
  adsenseId: { type: String, default: "" },
  groqKey: { type: String, default: "" },
  geminiKey: { type: String, default: "" },
  youtubeKey: { type: String, default: "" },
  jazzcashNumber: { type: String, default: "" },
  easypaisaNumber: { type: String, default: "" },
  bankName: { type: String, default: "" },
  bankAccount: { type: String, default: "" },
  bankTitle: { type: String, default: "" },
  whatsappNumber: { type: String, default: "923000000000" },
  lastSiteAuditRecommendations: { type: String, default: "" },
});

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
