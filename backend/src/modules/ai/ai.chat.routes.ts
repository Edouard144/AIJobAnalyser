// AI chat routes
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { aiChatController } from "./ai.chat.controller";

const router = Router();

router.post("/chat", requireAuth, aiChatController.chat);
router.get("/chat/:jobId", requireAuth, aiChatController.getHistory);
router.post("/parse-filter", requireAuth, aiChatController.parseFilter);

export default router;