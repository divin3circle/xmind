import { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: string;
  walletAddress: string; // primary identity, lowercase
  firstSeenAt?: Date;
  lastActiveAt?: Date;
  totalUsdDeposited: number; // analytics only
  totalAgentsCreated: number;
  isBlacklisted: boolean;
  aiCreditsUsed: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    firstSeenAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    totalUsdDeposited: { type: Number, default: 0 },
    totalAgentsCreated: { type: Number, default: 0 },
    isBlacklisted: { type: Boolean, default: false },
    aiCreditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);
