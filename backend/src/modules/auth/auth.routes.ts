// auth routes
import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login",    validate(loginSchema),    authController.login);
router.post("/refresh",  validate(refreshSchema),  authController.refresh);

// Protected — requires valid access token
router.get("/me", requireAuth, authController.me);

export default router;