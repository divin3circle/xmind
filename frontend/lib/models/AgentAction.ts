import { Schema, model, models } from "mongoose";

export enum ActionType {
  SWAP = "swap",
  STAKE = "stake",
  UNSTAKE = "unstake",
  BRIDGE = "bridge",
  HOLD = "hold",
  REBALANCE = "rebalance",
}

export enum ActionStatus {
  PLANNED = "planned",
  SUBMITTED = "submitted",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export interface IAgentAction {
  _id?: string;
  agentId: Schema.Types.ObjectId;
  actionType: ActionType;
  reasoning: string;
  confidenceScore: number;
  proposedTx: any; // JSON object
  txHash?: string;
  status: ActionStatus;
  createdAt?: Date;
  executedAt?: Date;
}

const agentActionSchema = new Schema<IAgentAction>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "VaultAgent", required: true, index: true },
    actionType: {
      type: String,
      enum: Object.values(ActionType),
      required: true,
    },
    reasoning: { type: String, required: true },
    confidenceScore: { type: Number, required: true },
    proposedTx: { type: Schema.Types.Mixed, required: true },
    txHash: { type: String, lowercase: true },
    status: {
      type: String,
      enum: Object.values(ActionStatus),
      default: ActionStatus.PLANNED,
    },
    executedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const AgentAction = models.AgentAction || model<IAgentAction>("AgentAction", agentActionSchema);
