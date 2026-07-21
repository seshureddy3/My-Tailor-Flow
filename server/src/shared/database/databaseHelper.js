import mongoose from "mongoose";

export const isValid = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid ID format");
    error.statusCode = 400;
    throw error;
  }
};
