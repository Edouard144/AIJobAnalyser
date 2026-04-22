// notifications routes
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { notificationsController } from "./notifications.controller";

const router = Router();

router.get("/", requireAuth, notificationsController.get);
router.patch("/:id/read", requireAuth, notificationsController.markRead);
router.patch("/read-all", requireAuth, notificationsController.markAllRead);

export default router;