import { Schema, model } from "mongoose";

export interface IUser {
  _id?: string;
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isAgent: boolean;
  totalTasksCompleted?: number;
  totalEarnings?: bigint;
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
    displayName: String,
    avatar: String,
    bio: String,
    isAgent: { type: Boolean, default: false },
    totalTasksCompleted: { type: Number, default: 0 },
    totalEarnings: { type: BigInt, default: 0n },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
