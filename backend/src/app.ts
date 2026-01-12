import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";

import { config } from "./config/env";
import { connectMongoDB } from "./config/mongodb";
import { requestLogger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth";
import tasksRoutes from "./routes/tasks";
import bidsRoutes from "./routes/bids";
import proofsRoutes from "./routes/proofs";
import disputesRoutes from "./routes/disputes";
import agentsRoutes from "./routes/agents";
import creatorsRoutes from "./routes/creators";

export const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/bids", bidsRoutes);
app.use("/proofs", proofsRoutes);
app.use("/disputes", disputesRoutes);
app.use("/agents", agentsRoutes);
app.use("/creators", creatorsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start server
export async function startServer() {
  try {
    await connectMongoDB();
    const server = app.listen(config.PORT, () => {
      console.log(`✅ Server running on http://localhost:${config.PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

export default app;
