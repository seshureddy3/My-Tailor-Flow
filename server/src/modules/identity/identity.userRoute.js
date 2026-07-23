import { Router } from "express";

// controllers
import {
  changePassword,
  editUser,
  loginUser,
  logoutUser,
  registerUser,
} from "./controllers/user.js";
import { validate } from "../../shared/middleware/validationError.js";

// validators
import {
  handleEditUser,
  handleLogin,
  handleRegister,
  handlePasswords,
} from "./validations/user.js";

// middleware
import { authenticateUser } from "../../shared/middleware/authorization.js";

// ratelimiters
import { sensitiveEndPointsLimiter } from "../../shared/middleware/globalRateLimiter.js";

const router = Router();

router.post(
  "/register",
  sensitiveEndPointsLimiter,
  validate(handleRegister),
  registerUser,
);

router.post(
  "/login",
  sensitiveEndPointsLimiter,
  validate(handleLogin),
  loginUser,
);

router.patch("/edit", authenticateUser, validate(handleEditUser), editUser);

router.put(
  "/changePassword",
  authenticateUser,
  validate(handlePasswords),
  changePassword,
);

router.post("/logout", authenticateUser, logoutUser);

export default router;
