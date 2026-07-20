import "dotenv/config";

import mongoose from "mongoose";

import { app } from "../app/app.js";
import { connectedToDB } from "../shared/database/db.js";
import { logger } from "../shared/logger/logger.js";

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  logger.error(`CRITICAL: Uncaught Exception thrown: ${err}`);

  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `CRITICAL: Unhandled Promise Rejection at: ${promise}| Reason: ${reason}`,
  );
});

export const bootstapServer = async () => {
  logger.info("Initializing system bootloader components...");

  const connected = await connectedToDB();

  if (!connected) {
    logger.error(
      "CRITICAL WARNING: Database connection failed. Operational data contexts will be unavailable.",
    );
    app.locals.dbConnected = false;
  } else {
    app.locals.dbConnected = true;
  }

  const server = app.listen(PORT, () => {
    logger.info(
      `Application context online. Server listening on network port: ${PORT} [Env: ${process.env.NODE_ENV || "development"}]`,
    );
  });

  server.on("error", (err) => {
    logger.error(`Server failed to start: ${err.message}`);
    process.exit(1);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    await mongoose.connection.close();

    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

bootstapServer().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`, err);
  process.exit(1);
});
