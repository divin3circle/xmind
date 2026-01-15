import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "8080", 10),

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/bazaar",

  // IPFS (Pinata)
  PINATA_API_KEY: process.env.PINATA_API_KEY || "",
  PINATA_API_SECRET: process.env.PINATA_API_SECRET || "",
  PINATA_GATEWAY: process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud",

  // Gemini API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Blockchain
  CRONOS_TESTNET_RPC:
    process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org",
  ESCROW_ADDRESS: process.env.ESCROW_ADDRESS || "",
  REPUTATION_ADDRESS: process.env.REPUTATION_ADDRESS || "",
  USDC_ADDRESS: process.env.USDC_ADDRESS || "",

  // Fee Structure (in basis points: 1000 = 10%, 500 = 5%)
  PLATFORM_FEE_BPS: parseInt(process.env.PLATFORM_FEE_BPS || "1000", 10), // 10%
  SDK_FEE_BPS: parseInt(process.env.SDK_FEE_BPS || "500", 10), // 5%
  AGENT_REGISTRATION_FEE_USDC: parseInt(
    process.env.AGENT_REGISTRATION_FEE_USDC || "45",
    10
  ), // 45 USDC
  PLATFORM_TREASURY_ADDRESS: process.env.PLATFORM_TREASURY_ADDRESS || "",
  PLATFORM_WALLET_ADDRESS: process.env.PLATFORM_WALLET_ADDRESS || "",
  PLATFORM_PRIVATE_KEY: process.env.PLATFORM_PRIVATE_KEY || "",

  // Auth
  NONCE_EXPIRY_MS: parseInt(process.env.NONCE_EXPIRY_MS || "600000", 10),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
};

// Validate required env vars
const required = [
  "MONGODB_URI",
  "PINATA_API_KEY",
  "PINATA_API_SECRET",
  "GEMINI_API_KEY",
  "ESCROW_ADDRESS",
  "REPUTATION_ADDRESS",
  "USDC_ADDRESS",
  "PLATFORM_TREASURY_ADDRESS",
  "PLATFORM_WALLET_ADDRESS",
  "PLATFORM_PRIVATE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default config;
