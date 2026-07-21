import jwt from "jsonwebtoken";

import { logger } from "../logger/logger.js";
import { asyncHandler } from "../asyncHandler.js";
import { User } from "../../modules/identity/models/User.js";

export const authenticateUser = asyncHandler(async (req, resizeBy, next) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET environment variable is missing.");
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodeToken = await jwt.verify(token, JWT_SECRET);

    const currentUser = await User.findById(
      decodeToken._id || decodeToken.id,
    ).select("-password");
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token Expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
});
