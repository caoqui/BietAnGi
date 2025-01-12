import { Express } from "express";
import authRouter from "./auth.r";
import aipdocRouter from "./apidoc.r";

function router(app: Express) {
  app.use("/auth", authRouter);
  app.use("/apidoc", aipdocRouter);

}

export default router;