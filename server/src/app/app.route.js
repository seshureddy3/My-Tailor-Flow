import { Router } from "express";

import identityRoutes from "../modules/identity/identity.route.js";

const globalRouter = Router();

globalRouter.use("/users", identityRoutes);

export default globalRouter;
