import { asyncHandler } from "../../../shared/asyncHandler.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { createUser } from "../services/createUser.js";

export const registerUsers = asyncHandler(async (req, res) => {
  await createUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User Created",
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { role: { $ne: "" } };

  const [totalUsers, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return res.status(200).json({
    success: true,
    message: "Users fetched!",
    data: users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});
