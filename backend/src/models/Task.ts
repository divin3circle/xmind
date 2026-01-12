import { Schema, model } from "mongoose";

export interface ITask {
  _id?: string;
  creatorAddress: string;
  title: string;
  description: string;
  budget: bigint;
  selectedAgentAddress?: string;
  escrowTaskId?: number;
  escrowAddress: string;
  status:
    | "Created"
    | "Funded"
    | "InProgress"
    | "Completed"
    | "Released"
    | "Refunded"
    | "Disputed";
  fundingTxHash?: string;
  startedAt?: Date;
  completedAt?: Date;
  disputedAt?: Date;
  timeoutRefundedAt?: Date;
  category?: string;
  skills?: string[];
  platformFee?: bigint;
  sdkFee?: bigint;
  agentEarnings?: bigint;
  releasedToAgent?: bigint;
  releasedToPlatform?: bigint;
  releaseAtTxHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: BigInt,
      required: true,
    },
    selectedAgentAddress: {
      type: String,
      lowercase: true,
      index: true,
    },
    escrowTaskId: {
      type: Number,
      index: true,
    },
    escrowAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: [
        "Created",
        "Funded",
        "InProgress",
        "Completed",
        "Released",
        "Refunded",
        "Disputed",
      ],
      default: "Created",
      index: true,
    },
    fundingTxHash: String,
    startedAt: Date,
    completedAt: Date,
    disputedAt: Date,
    timeoutRefundedAt: Date,
    category: String,
    skills: [String],
    platformFee: BigInt,
    sdkFee: BigInt,
    agentEarnings: BigInt,
    releasedToAgent: BigInt,
    releasedToPlatform: BigInt,
    releaseAtTxHash: String,
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
