import { logger } from "../logger/logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res && res.headersSent) {
    return next(err);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const request = req || {};
  const error = err || {};

  if (error.code === 11000) {
    error.statusCode = 400;
    error.message = "This email is already registered.";
  }

  const statusCode = error.status || error.statusCode || 500;
  const clientMessage =
    statusCode >= 500 && isProduction
      ? "An unexpected internal server error occurred. Please try again later."
      : error.message || "Internal server error";

  const pathParts = (request.originalUrl || "/").split("/");
  const detectedModule = pathParts[3] || "core";

  const errorMetadata = {
    module: error.module || detectedModule,
    errorCode: error.code || "INTERNAL_ERROR",
    path: request.originalUrl || "/",
    method: request.method || "UNKNOWN",
    ip: request.ip || "unknown",
    userId: request.user?.id || request.user?._id || "anonymous",
  };

  logger.error(
    "Exception caught in [%s] module | Method: %s | Path: %s | Message: %s | %O",
    String(errorMetadata.module).toUpperCase(),
    errorMetadata.method,
    errorMetadata.path,
    error.message,
    error,
  );

  if (!res || typeof res.status !== "function") {
    logger.error("Error handler received an invalid response object.");
    return;
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorMetadata.errorCode,
      message: clientMessage,
      ...(!isProduction && { stack: error.stack }),
    },
  });
};
