import { Schema, model, Types } from "mongoose";

export interface IBlockchainEvent {
  _id?: string;
  eventType: string;
  taskId?: Types.ObjectId;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  eventData: Record<string, any>;
  processed: boolean;
  createdAt?: Date;
}

const eventSchema = new Schema<IBlockchainEvent>(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      index: true,
    },
    blockNumber: {
      type: Number,
      required: true,
      index: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    logIndex: {
      type: Number,
      required: true,
    },
    eventData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    processed: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BlockchainEvent = model<IBlockchainEvent>(
  "BlockchainEvent",
  eventSchema
);
