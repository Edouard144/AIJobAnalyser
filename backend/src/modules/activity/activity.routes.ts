// activity routes
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { activityController } from "./activity.controller";

const router = Router();

router.get("/", requireAuth, activityController.getMy);
router.get("/all", requireAuth, activityController.getAll);
router.post("/", requireAuth, activityController.create);

export default router;