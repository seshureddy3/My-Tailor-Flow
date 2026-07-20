import express from "express";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "../shared/errors/errorHandler.js";
import globalRouter from "./app.route.js";

export const app = express();

// Global Handler
app.use(cors());
app.use(helmet());
app.use(express.json());

// routes
app.use("/api", globalRouter);

// Global Error Handler
app.use(errorHandler);
