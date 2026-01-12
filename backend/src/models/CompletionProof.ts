import { Schema, model, Types } from "mongoose";

export interface ICompletionProof {
  _id?: string;
  taskId: Types.ObjectId;
  submittedByAddress: string;
  proofUrl: string;
  proofType: "TextReport" | "CodeRepo" | "Image" | "Video" | "Dataset";
  geminiResponse?: {
    isValid: boolean;
    feedback: string;
    confidence: number;
  };
  isApproved?: boolean;
  approvedByAddress?: string;
  approvedAt?: Date;
  txHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const completionProofSchema = new Schema<ICompletionProof>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    submittedByAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    proofUrl: {
      type: String,
      required: true,
    },
    proofType: {
      type: String,
      enum: ["TextReport", "CodeRepo", "Image", "Video", "Dataset"],
      required: true,
    },
    geminiResponse: {
      isValid: Boolean,
      feedback: String,
      confidence: Number,
    },
    isApproved: { type: Boolean, default: false },
    approvedByAddress: {
      type: String,
      lowercase: true,
    },
    approvedAt: Date,
    txHash: String,
  },
  { timestamps: true }
);

export const CompletionProof = model<ICompletionProof>(
  "CompletionProof",
  completionProofSchema
);
