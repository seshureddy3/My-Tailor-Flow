import mongoose from "mongoose";

import { logger } from "../logger/logger.js";

const { connect, connection } = mongoose;

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

/**
 * Event listeners to monitor the ongoing health of the database connection.
 * Necessary in production to catch drops that happen *after* initial boot.
 */

connection.on("connected", () => {
  logger.info("MongoDB cluster connection established.");
});
connection.on("error", (err) => {
  logger.error(`MongoDB runtime error encountered: ${err}`);
});
connection.on("disconnected", () => {
  logger.info("MongoDB disconnected");
});

export const connectedToDB = async (retryCount = 0) => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    logger.error(
      "MongoDB connection failed due to invalid configuration. Please check your setup parameters",
    );
    return false;
  }

  try {
    const connectOptions = {
      autoIndex: process.env?.NODE_ENV !== "production", // Disable heavy index builds in prod
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging forever if DB is down
      socketTimeoutMS: 45000, // Close inactive sockets after 45s
    };

    await connect(MONGODB_URI, connectOptions);

    return true;
  } catch (err) {
    logger.error(
      "MongoDB connection failed on attempt %d: %O",
      retryCount + 1,
      err,
    );

    if (retryCount < MAX_RETRIES - 1) {
      logger.info(
        "Scheduling connection retry in %d seconds...",
        RETRY_INTERVAL / 1000,
      );

      // Wait out the interval before trying again
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectedToDB(retryCount + 1);
    }

    logger.error(
      "Critical: MongoDB failed to connect after %d attempts. Halting retry loop.",
      MAX_RETRIES,
    );
    return false;
  }
};
