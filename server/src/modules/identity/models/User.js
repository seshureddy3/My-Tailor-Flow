import { model, Schema } from "mongoose";
import argon2 from "argon2";

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["tailor", "customer"],
      default: "customer",
    },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await argon2.hash(this.password);
});

UserSchema.methods.comparePassword = async function (userPassword) {
  if (!this.password) {
    return false;
  }

  return argon2.verify(this.password, userPassword);
};

export const User = model("User", UserSchema);
