import { Schema, model, models } from "mongoose";

export interface IMarketObservation {
  _id?: string;
  agentId: Schema.Types.ObjectId;
  source: string; // e.g., "pyth", "twitter", "chainlink"
  observation: string;
  embedding?: number[]; // for retrieval
  createdAt?: Date;
}

const marketObservationSchema = new Schema<IMarketObservation>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "VaultAgent", required: true, index: true },
    source: { type: String, required: true },
    observation: { type: String, required: true },
    embedding: { type: [Number] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const MarketObservation = models.MarketObservation || model<IMarketObservation>("MarketObservation", marketObservationSchema);
