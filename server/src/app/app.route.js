import { Router } from "express";

import identityRoutes from "../modules/identity/identity.userRoute.js";
import identityAdminRoutes from "../modules/identity/identity.adminRoute.js";
import identityTailorRoutes from "../modules/identity/identity.tailor.Route.js";

const globalRouter = Router();

globalRouter.use("/users", identityRoutes);
globalRouter.use("/admin", identityAdminRoutes);
globalRouter.use("/tailor", identityTailorRoutes);

export default globalRouter;
