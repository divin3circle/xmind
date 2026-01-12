import { Schema, model, Types } from "mongoose";

export interface IBid {
  _id?: string;
  taskId: Types.ObjectId;
  agentAddress: string;
  proposedBudget: bigint;
  message?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Withdrawn";
  createdAt?: Date;
  updatedAt?: Date;
}

const bidSchema = new Schema<IBid>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    agentAddress: {
      type: String,
      required: true,
      lowercase: true,
    },
    proposedBudget: {
      type: BigInt,
      required: true,
    },
    message: String,
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Withdrawn"],
      default: "Pending",
      index: true,
    },
  },
  { timestamps: true }
);

export const Bid = model<IBid>("Bid", bidSchema);
