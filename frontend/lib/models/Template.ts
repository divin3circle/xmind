import { Schema, model, models } from "mongoose";

export interface ITemplate {
  _id?: string;
  templateName: string;
  image: string;
  tagline: string;
  creatorAddress: string;
  systemPrompt: string;
  description: string;
  usedBy: number;
  totalEarned: number;
  ratings: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    templateName: { type: String, required: true },
    image: { type: String, required: true },
    tagline: { type: String, required: true },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    usedBy: { type: Number, required: true, default: 0 },
    systemPrompt: { type: String, required: true, default: "" },
    totalEarned: { type: Number, required: true, default: 0 },
    ratings: { type: [Number], required: true, default: [] },
    description: { type: String, required: true, default: "" },
  },
  { timestamps: true },
);

export const Template =
  models.Template || model<ITemplate>("Template", templateSchema);
