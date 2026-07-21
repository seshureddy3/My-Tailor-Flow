import { User } from "../models/User.js";

export const createUser = async (userData) => {
  if (!userData || Object.keys(userData).length === 0) {
    const error = new Error("Payload Required");
    error.statusCode = 400;
    throw error;
  }

  const { firstName, lastName, email, password, role } = userData;

  return await User.create({
    firstName,
    lastName,
    email: email.toLowerCase().trim(),
    password,
    role: role || "customer",
  });
};
