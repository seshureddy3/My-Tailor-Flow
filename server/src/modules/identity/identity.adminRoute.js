import { Router } from "express";

import { getAllUsers, registerUsers } from "./controllers/admin.js";
import {
  whoAreYou,
  authenticateUser,
} from "../../shared/middleware/authorization.js";
import { validate } from "../../shared/middleware/validationError.js";
import { handleAdminRegister } from "./validations/admin.js";

const router = Router();

router.get("/all-users", authenticateUser, whoAreYou("admin"), getAllUsers);

router.post(
  "/add-user",
  authenticateUser,
  whoAreYou("admin", "tailor"),
  validate(handleAdminRegister),
  registerUsers,
);

export default router;
