import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { createUser } from "../services/createUser.js";
import { asyncHandler } from "../../../shared/asyncHandler.js";
import { generateToken } from "../services/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const newUser = await createUser(req.body);

  const { accessToken, tokenRefresh } = await generateToken(newUser);

  res.cookie("refreshToken", tokenRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    message: "User Created!",
    accessToken,
    RefreshToken: tokenRefresh,
  });
});
