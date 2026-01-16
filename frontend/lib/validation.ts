import { z } from "zod";

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

export const authVerifySchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Message is required"),
});

export type AuthVerifyInput = z.infer<typeof authVerifySchema>;
