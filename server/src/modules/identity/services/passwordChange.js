import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { isValid } from "../../../shared/database/databaseHelper.js";

export const passwordChange = async (userId, userData) => {
  console.log(userId);

  isValid(userId);
  if (
    !userData ||
    !userData.oldPassword ||
    !userData.newPassword ||
    !userData.refreshToken
  ) {
    const error = new Error("Missing required password fields");
    error.statusCode = 400;
    throw error;
  }

  const { oldPassword, newPassword } = userData;

  if (oldPassword === newPassword) {
    const error = new Error("New Password cannot be the same as old password");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    const error = new Error("Old Password does not match");
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  await RefreshToken.deleteMany({ user: userId });
};
