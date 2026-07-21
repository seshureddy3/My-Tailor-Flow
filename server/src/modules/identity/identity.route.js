import { Router } from "express";

import {
  changePassword,
  editUser,
  loginUser,
  registerUser,
} from "./controllers/user.js";
import { validate } from "../../shared/middleware/validationError.js";
import {
  handleEditUser,
  handleLogin,
  handleRegister,
} from "./validations/user.js";
import { sensitiveEndPointsLimiter } from "../../shared/middleware/globalRateLimiter.js";
import { authenticateUser } from "../../shared/middleware/authorization.js";

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

router.put("/changePassword", authenticateUser, changePassword);

export default router;
