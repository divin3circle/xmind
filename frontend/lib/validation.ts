import { z } from "zod";

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const authVerifySchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Message is required"),
});

export const chatVerifySchema = z.object({
  message: z.string().min(1, "Message is required"),
  agentId: z.string().min(1, "Agent ID is required"),
  userAddress: walletAddressSchema,
});

export type AuthVerifyInput = z.infer<typeof authVerifySchema>;
export type ChatVerifyInput = z.infer<typeof chatVerifySchema>;
