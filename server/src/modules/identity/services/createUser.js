import { User } from "../models/User.js";

export const createUser = async (userData) => {
  const { firstName, lastName, email, password, role } = userData;

  return await User.create({
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    password,
    role: role || "customer",
  });
};
