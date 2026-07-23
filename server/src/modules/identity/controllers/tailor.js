import { asyncHandler } from "../../../shared/asyncHandler.js";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { isValid } from "../../../shared/database/databaseHelper.js";
import { createUser } from "../services/createUser.js";

export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { role: { $nin: ["admin", "tailor"] } };

  const [totalUsers, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter, { role: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
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

export const getAllTailors = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const filter = { role: { $nin: ["admin", "customer"] } };

  const [totalUsers, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter, { role: 0 })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
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

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  isValid(id);

  const user = await User.findById(id).select("-password").lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found!",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User fetched",
    data: user,
  });
});

export const addUser = asyncHandler(async (req, red) => {
  await createUser(req.body);

  return res.status(201).json({
    success: true,
    message: "User Created!",
  });
});

export const editUser = asyncHandler(async (req, res) => {});

export const deleteUsers = asyncHandler(async (req, res) => {});
