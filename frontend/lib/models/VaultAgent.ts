import { Schema, model, models } from "mongoose";
import { RiskProfile, IVaultAgent } from "@/lib/types/vault";

const vaultAgentSchema = new Schema<IVaultAgent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    vaultAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    underlyingToken: { type: String, required: true, lowercase: true },
    chainId: { type: Number, required: true },
    riskProfile: {
      type: String,
      enum: Object.values(RiskProfile),
      default: RiskProfile.BALANCED,
    },
    systemPrompt: { type: String, required: true },
    strategyDescription: { type: String, required: true },
    tradingEnabled: { type: Boolean, default: true },
    maxPositionSizeBps: { type: Number, default: 1000 }, // 10% default
    maxDailyTradeBps: { type: Number, default: 2000 }, // 20% default
    rebalanceCooldownSeconds: { type: Number, default: 3600 }, // 1 hour
    lastAgentActionAt: { type: Date },
    image: { type: String },
  },
  { timestamps: true },
);

export const VaultAgent = models.VaultAgent || model<IVaultAgent>("VaultAgent", vaultAgentSchema);
