import { Router } from "express";

import { registerUser } from "./controllers/user.js";
import { validate } from "../../shared/middleware/validationError.js";
import { handleRegister } from "./validations/user.js";

const router = Router();

router.post("/register", validate(handleRegister), registerUser);

export default router;
