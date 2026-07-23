import jwt from "jsonwebtoken";

import { logger } from "../logger/logger.js";
import { asyncHandler } from "../asyncHandler.js";
import { User } from "../../modules/identity/models/User.js";

export const authenticateUser = asyncHandler(async (req, res, next) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET environment variable is missing.");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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

    const currentUser = await User.findById(decodeToken._id || decodeToken.id);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10,
      );

      if (decodeToken.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized: Password recently changed. Please log in again.",
        });
      }
    }

    const userObj = currentUser.toObject();
    delete userObj.password;

    req.user = userObj;
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

export const whoAreYou = (...roles) => {
  const allowedRoles = new Set(roles.map((role) => role.toLowerCase()));

  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();

    if (!userRole || !allowedRoles.has(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action",
      });
    }
    next();
  };
};
