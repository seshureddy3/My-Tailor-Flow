import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { createUser } from "../services/createUser.js";
import { asyncHandler } from "../../../shared/asyncHandler.js";
import { generateToken } from "../services/generateToken.js";
import { logger } from "../../../shared/logger/logger.js";
import { updateUser } from "../services/updateUser.js";
import { isValid } from "../../../shared/database/databaseHelper.js";

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

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    logger.warn("Invalid email or password");
    return res.status(404).json({
      success: false,
      message: "Inavlid email or password",
    });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const { accessToken, tokenRefresh } = await generateToken(user);

  const message = "Login Success!";

  res.cookie("refreshToken", tokenRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: message,
    accessToken,
  });
});

export const editUser = asyncHandler(async (req, res) => {
  const user = await updateUser(req.user.id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: "Updated",
    data: user,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  isValid(userId);

  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    const error = new Error("Old password does not match");
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Updated successfully!",
  });
});

export const rotateRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // 1. Find & Validate Existence
  const existingTokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (!existingTokenDoc) {
    const error = new Error("Invalid refresh token.");
    error.statusCode = 401;
    throw error;
  }

  // 2. REPLAY ATTACK DETECTION
  if (existingTokenDoc.used) {
    logger.error(
      `CRITICAL: Replay attack detected for user ${existingTokenDoc.user}`,
    );
    await RefreshToken.deleteMany({ user: existingTokenDoc.user });

    const error = new Error(
      "Security alert: Replay attack detected. Please log in again.",
    );
    error.statusCode = 401;
    throw error;
  }

  // 3. EXPIRATION CHECK
  if (existingTokenDoc.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: existingTokenDoc._id });
    const error = new Error("Refresh token expired.");
    error.statusCode = 401;
    throw error;
  }

  // 4. ROTATION (Using a transaction is recommended here)
  existingTokenDoc.used = true;
  await existingTokenDoc.save();

  const user = await User.findById(existingTokenDoc.user);
  if (!user) {
    const error = new Error("User associated with token no longer exists.");
    error.statusCode = 404;
    throw error;
  }

  const { accessToken: newAccessToken, tokenRefresh: newRefreshToken } =
    await generateToken(user);

  return res.status(200).json({
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});
