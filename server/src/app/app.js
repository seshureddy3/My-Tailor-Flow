import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "../shared/errors/errorHandler.js";
import globalRouter from "./app.route.js";
import { globalRateLimiter } from "../shared/middleware/globalRateLimiter.js";

export const app = express();

app.set("trust proxy", 1);

// Global Handler
app.use(cors());
app.use(helmet());
app.use(express.json());

// rateLimiter
app.use(globalRateLimiter);

// routes
app.use("/api", globalRouter);

// Global Error Handler
app.use(errorHandler);
