import { Schema, model } from "mongoose";

export interface IChat {
  _id?: string;
  agentId: string;
  userAddress: string;
  messages: { sender: "user" | "agent"; content: string; timestamp: Date }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    agentId: { type: String, required: true, index: true },
    userAddress: { type: String, required: true, lowercase: true, index: true },
    messages: {
      type: [
        {
          sender: { type: String, enum: ["user", "agent"], required: true },
          content: { type: String, required: true },
          timestamp: { type: Date, required: true, default: Date.now },
        },
      ],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
);

export const Chat = model<IChat>("Chat", chatSchema);
