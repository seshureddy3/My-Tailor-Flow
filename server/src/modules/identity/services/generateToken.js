import jwt from "jsonwebtoken";
import crypto from "crypto";

import { logger } from "../../../shared/logger/logger.js";
import { RefreshToken } from "../models/RefreshToken.js";

export const generateToken = async (user) => {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    logger.warn(
      "Missing JWT configuration. Set JWT_SECRET and REFRESH_SECRET.",
    );
    return false;
  }

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "user";

  const accessToken = jwt.sign(
    {
      id: user._id.toString(),
      userId: user._id.toString(),
      userName,
    },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  const tokenRefresh = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token: tokenRefresh,
    user: user._id,
    expiresAt,
  });

  return { accessToken, tokenRefresh };
};
