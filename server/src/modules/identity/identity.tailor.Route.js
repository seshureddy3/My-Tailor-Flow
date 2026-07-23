import { Router } from "express";

import { authenticateUser } from "../../shared/middleware/authorization.js";
import {
  getAllCustomers,
  getAllTailors,
  getUser,
} from "./controllers/tailor.js";
import {validate} from "../../"

const router = Router();

router.get("/all-customers", authenticateUser, getAllCustomers);
router.get("/all-tailors", authenticateUser, getAllTailors);
router.get("/user/:id", authenticateUser, getUser);
router.get("/addUser", authenticateUser, validate)

export default router;
