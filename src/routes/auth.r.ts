import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import passport from "passport";
import authController from "../controllers/auth.c";
import middlewareController from "../middleware/middleware";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/register", authController.registerUser);

// router.post("/login", authController.loginUser);

// Google authentication route
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// router.get(
//   "/google/callback",
//   (req: Request, res: Response, next: NextFunction) => {
//     passport.authenticate("google", (err: any, profile: any) => {
//       if (err) {
//         console.error("Error during authentication:", err);
//         return next(err);
//       }
//       req.user = profile;
//       next();
//     })(req, res, next);
//   },
//   // middlewareController.getUserId,
//   authController.googleAuth
// );

// router.post(
//   "/refresh",
//   // middlewareController.verifyRefreshToken,
//   authController.requestRefreshToken
// );

// router.post("/logout", authController.logoutUser);

export default router;