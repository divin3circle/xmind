import mongoose from "mongoose";
import { config } from "./env";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnection failed:", error);
    throw error;
  }
}

export default mongoose;
