import { Schema, model } from "mongoose";

export interface IAgentReputation {
  _id?: string;
  agentAddress: string;
  completedTasks: number;
  successfulTasks: number;
  failedTasks: number;
  disputes: number;
  score: number;
  totalEarnings: bigint;
  lastUpdatedAt: Date;
  onchainLastUpdate: Date;
}

const agentReputationSchema = new Schema<IAgentReputation>(
  {
    agentAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    completedTasks: { type: Number, default: 0 },
    successfulTasks: { type: Number, default: 0 },
    failedTasks: { type: Number, default: 0 },
    disputes: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalEarnings: { type: BigInt, default: 0n },
    lastUpdatedAt: { type: Date, default: Date.now },
    onchainLastUpdate: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const AgentReputation = model<IAgentReputation>(
  "AgentReputation",
  agentReputationSchema
);
