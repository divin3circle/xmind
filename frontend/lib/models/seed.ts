import mongoose from "mongoose";
import config from "@/config/env";

const MONGODB_URI = config.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(MONGODB_URI!);
}

async function main() {
  try {
    await dbConnect();
    console.log("Database connected. Use a new database name in your MONGODB_URI for a clean start.");
    // Add future initialization logic here if needed
    process.exit(0);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

main();
