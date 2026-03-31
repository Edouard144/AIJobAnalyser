// screening routes
import { Router } from "express";
import { screeningController } from "./screening.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router({ mergeParams: true }); // access :jobId from parent

router.use(requireAuth);

// Trigger AI screening
router.post("/run",     screeningController.run);

// Fetch saved results
router.get("/results",  screeningController.getResults);

export default router;