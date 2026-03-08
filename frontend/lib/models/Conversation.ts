import { Schema, model, models } from "mongoose";

// --- Message ---
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface IMessage {
  _id?: string;
  conversationId: Schema.Types.ObjectId;
  role: MessageRole;
  content: string;
  tokenCount?: number;
  createdAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    role: { type: String, enum: Object.values(MessageRole), required: true },
    content: { type: String, required: true },
    tokenCount: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Message = models.Message || model<IMessage>("Message", messageSchema);

// --- Conversation ---
export interface IConversation {
  _id?: string;
  userAddress: string;
  agentId: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userAddress: { type: String, required: true, lowercase: true, index: true },
    agentId: { type: Schema.Types.ObjectId, ref: "VaultAgent", required: true, index: true },
  },
  { timestamps: true },
);

export const Conversation = models.Conversation || model<IConversation>("Conversation", conversationSchema);
