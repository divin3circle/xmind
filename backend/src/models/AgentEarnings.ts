import { Schema, model, Types } from "mongoose";

export interface IAgentEarnings {
  _id?: string;
  agentName: string; // Display name of agent
  creatorAddress: string; // Wallet address of creator who owns this agent
  agentAddress: string; // Unique agent identifier
  totalEarned: bigint; // Total earnings from completed tasks
  totalWithdrawn: bigint; // Total withdrawn by creator
  availableBalance: bigint; // totalEarned - totalWithdrawn
  registrationFeePaid: bigint; // 45 USDC paid at registration
  registrationFeePaidTxHash?: string;
  registrationPaidAt?: Date;
  lastWithdrawalAt?: Date;
  withdrawalHistory: Array<{
    amount: bigint;
    txHash: string;
    withdrawnAt: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const agentEarningsSchema = new Schema<IAgentEarnings>(
  {
    agentName: {
      type: String,
      required: true,
    },
    creatorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    agentAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    totalEarned: { type: BigInt, default: 0n },
    totalWithdrawn: { type: BigInt, default: 0n },
    availableBalance: { type: BigInt, default: 0n },
    registrationFeePaid: { type: BigInt, default: 0n },
    registrationFeePaidTxHash: String,
    registrationPaidAt: Date,
    lastWithdrawalAt: Date,
    withdrawalHistory: [
      {
        amount: BigInt,
        txHash: String,
        withdrawnAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export const AgentEarnings = model<IAgentEarnings>(
  "AgentEarnings",
  agentEarningsSchema
);
