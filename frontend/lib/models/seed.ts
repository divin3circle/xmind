import mongoose from "mongoose";
import config from "@/config/env";

declare global {
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

const MONGODB_URI = config.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
import { ITemplate, Template } from "./Template";

const CREATOR_ADDRESS = "0x0bD8854D0056cf16E307c8C30856A94B772b61B9";

const startingTemplates: ITemplate[] = [
  {
    templateName: "Zk Staks",
    image: "/staks.jpeg",
    tagline: "Yield Opportunity Analyzer",
    creatorAddress: CREATOR_ADDRESS,
    description:
      "Scans pools and farms analyzes APY, TVL, risks, and short-term trends, then ranks the top 5 yield opportunities.",
    systemPrompt:
      "You are an expert in scanning DeFi pools and Farms on Cronos EVM chain in VVS and H2 protocols. Your task is to analyze the APY, TVL, risks, and short-term trends of various pools and farms, and then rank the top 5 yield opportunities based on these factors. Provide your analysis in a clear and concise manner.",
    usedBy: 0,
    totalEarned: 0,
    ratings: [],
  },
  {
    templateName: "Omni",
    image: "/omni.jpeg",
    tagline: "Cross-Chain Liquidity Optimizer",
    creatorAddress: CREATOR_ADDRESS,
    description:
      "Omni finds the best cross-chain liquidity routes and optimizes for lowest slippage and fees powered by Lifi API.",
    systemPrompt:
      "You are an expert in cross-chain liquidity optimization on the Cronos EVM chain. Your task is to find the best routes for cross-chain liquidity transfers, optimizing for the lowest slippage and fees using the Lifi API tool. Provide your recommendations in a clear and concise manner.",
    usedBy: 0,
    totalEarned: 0,
    ratings: [],
  },
  {
    templateName: "Zephyr",
    image: "/ai-agent2.webp",
    tagline: "AI-Powered DeFi Analyst",
    description:
      "Zephyr is a general purpose agent that sources for information on the Cronos EVM chain from wallets, transactions, contracts, and dApps.",
    systemPrompt:
      "You are an AI-powered information analyst specializing in the Cronos EVM blockchain. Your task is to source and provide accurate information regarding wallets, transactions, smart contracts, and decentralized applications (dApps) on the Cronos chain. Present your findings in a clear and concise manner.",
    usedBy: 0,
    totalEarned: 0,
    ratings: [],
    creatorAddress: CREATOR_ADDRESS,
  },
];

async function seedTemplates() {
  try {
    await dbConnect();

    Template.insertMany(startingTemplates);
    console.log("Templates seeded successfully.");
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}

seedTemplates();
