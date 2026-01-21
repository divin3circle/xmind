import { Schema, model, models } from "mongoose";

export interface IAction {
  title: string;
  body: string;
  ranAt: Date;
  usdceConsumed: number;
}

export interface IAgent {
  _id?: string;
  name: string;
  agentName?: string;
  image: string;
  creatorAddress: string;
  description: string;
  tasksCompleted: number;
  tasksRan: number;
  totalEarned: number;
  ratings: number[];
  systemPrompt?: string;
  walletAddress?: string;
  privateKey?: string; // is encrypted
  geminiKey?: string; // is encrypted
  contractAddress?: string;
  transactionHash?: string;
  tasks?: string[];
  actions?: IAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true },
    agentName: { type: String },
    image: { type: String, required: true },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, required: true, default: "" },
    tasksCompleted: { type: Number, required: true, default: 0 },
    tasksRan: { type: Number, default: 0 },
    totalEarned: { type: Number, required: true, default: 0 },
    ratings: { type: [Number], required: true, default: [] },
    systemPrompt: { type: String },
    walletAddress: { type: String, index: true },
    privateKey: { type: String },
    geminiKey: { type: String },
    contractAddress: { type: String, index: true },
    transactionHash: { type: String },
    tasks: { type: [String], default: [] },
    actions: {
      type: [
        {
          title: { type: String, required: true },
          body: { type: String, required: true },
          ranAt: { type: Date, required: true },
          usdceConsumed: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Agents = models.Agent || model<IAgent>("Agent", agentSchema);
