import { isValid } from "../../../shared/database/databaseHelper.js";
import { User } from "../models/User.js";

export const updateUser = async (userId, userData, currentUser) => {
  if (!userData || Object.keys(userData).length === 0) {
    const error = new Error("Payload is required");
    error.statusCode = 400;
    throw error;
  }

  const rolePermissions = {
    customer: ["firstName", "lastName", "email"],
    tailor: ["firstName", "lastName", "email", "role"],
  };

  isValid(userId);

  const allowedFields = rolePermissions[currentUser?.role] || [];
  const updates = Object.keys(userData || {});
  const hasDisallowedField = updates.some(
    (field) => !allowedFields.includes(field),
  );

  if (hasDisallowedField) {
    const error = new Error(
      "Your are not authorized to update one or more of these fields.",
    );
    error.statusCode = 403;
    throw error;
  }

  const sanitizedUpdateData = {};
  allowedFields.forEach((field) => {
    if (userData[field] !== undefined) {
      sanitizedUpdateData[field] = userData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdateData, {
    returnDocument: "after",
    runValidators: true,
  }).select("-password");

  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  return user;
};
