import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  blogId: mongoose.Types.ObjectId;
  name: string;
  content: string;
  createdAt: Date;
  approved: boolean;
}

const CommentSchema: Schema = new Schema({
  blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  approved: { type: Boolean, default: true },
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
