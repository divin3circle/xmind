import { Schema, model, Types } from "mongoose";

export interface IDispute {
  _id?: string;
  taskId: Types.ObjectId;
  initiatedByAddress: string;
  reason: string;
  status: "Open" | "UnderReview" | "Resolved";
  resolution?: {
    agentWon: boolean;
    notes?: string;
  };
  resolvedByAddress?: string;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    initiatedByAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "UnderReview", "Resolved"],
      default: "Open",
      index: true,
    },
    resolution: {
      agentWon: Boolean,
      notes: String,
    },
    resolvedByAddress: {
      type: String,
      lowercase: true,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export const Dispute = model<IDispute>("Dispute", disputeSchema);
