import { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: string;
  walletAddress: string;
  displayName?: string;
  spentUsdc: number;
  avatar?: string;
  bio?: string;
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
    spentUsdc: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export const User = models.User || model<IUser>("User", userSchema);
