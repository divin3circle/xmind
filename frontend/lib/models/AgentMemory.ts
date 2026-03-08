import { Schema, model, models } from "mongoose";

export enum MemoryType {
  ACTION = "action",
  OBSERVATION = "observation",
  REFLECTION = "reflection",
  MARKET = "market",
}

export interface IAgentMemory {
  _id?: string;
  agentId: Schema.Types.ObjectId;
  memoryType: MemoryType;
  summary: string;
  importanceScore: number; // 0-1
  embedding?: number[]; // for vector search
  relatedTxHash?: string;
  createdAt?: Date;
}

const agentMemorySchema = new Schema<IAgentMemory>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "VaultAgent", required: true, index: true },
    memoryType: {
      type: String,
      enum: Object.values(MemoryType),
      required: true,
    },
    summary: { type: String, required: true },
    importanceScore: { type: Number, default: 0.5 },
    embedding: { type: [Number] }, // You might need a more specific type if using specific DB like Pinecone/pgvector, but for Mongoose this is a start
    relatedTxHash: { type: String, lowercase: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AgentMemory = models.AgentMemory || model<IAgentMemory>("AgentMemory", agentMemorySchema);
