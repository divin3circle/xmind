import { Schema, model, models } from "mongoose";

export interface IAgentChatMessage {
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

export interface IAgentChat {
  _id?: string;
  agentId: string; // Contract address of the deployed agent
  userAddress: string;
  messages: IAgentChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const agentChatSchema = new Schema<IAgentChat>(
  {
    agentId: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    userAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    messages: [
      {
        content: { type: String, required: true },
        sender: { type: String, enum: ["user", "agent"], required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// Compound index for quick lookups
agentChatSchema.index({ agentId: 1, userAddress: 1 });

export const AgentChat =
  models.AgentChat || model<IAgentChat>("AgentChat", agentChatSchema);
