// team routes
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { teamController } from "./team.controller";

const router = Router();

router.get("/", requireAuth, teamController.getTeam);
router.post("/invite", requireAuth, teamController.invite);
router.patch("/:userId/role", requireAuth, teamController.updateRole);
router.delete("/:userId", requireAuth, teamController.remove);

export default router;