import { Schema, model } from "mongoose";

export interface IUser {
  _id?: string;
  walletAddress: string;
  displayName?: string;
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
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
