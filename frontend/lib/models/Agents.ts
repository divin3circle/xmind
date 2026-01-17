import { Schema, model, models } from "mongoose";

export interface IAgent {
  _id?: string;
  agentName: string;
  image: string;
  creatorAddress: string;
  description: string;
  tasksCompleted: number;
  totalEarned: number;
  ratings: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    agentName: { type: String, required: true },
    image: { type: String, required: true },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    tasksCompleted: { type: Number, required: true, default: 0 },
    totalEarned: { type: Number, required: true, default: 0 },
    ratings: { type: [Number], required: true, default: [] },
    description: { type: String, required: true, default: "" },
  },
  { timestamps: true },
);

export const Agent = models.Agent || model<IAgent>("Agent", agentSchema);
