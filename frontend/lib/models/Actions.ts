import { Schema, model } from "mongoose";

export interface IAction {
  _id?: string;
  name: string;
  walletAddress: string;
  fees: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const actionSchema = new Schema<IAction>(
  {
    name: { type: String, required: true },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    fees: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Action = model<IAction>("Action", actionSchema);
