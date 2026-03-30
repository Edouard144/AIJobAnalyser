// jobs routes
import { Router } from "express";
import { jobsController } from "./jobs.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
} from "./jobs.schema";

const router = Router();

// All job routes require login
router.use(requireAuth);

router.post(  "/",               validate(createJobSchema),       jobsController.create);
router.get(   "/",                                                 jobsController.getAll);
router.get(   "/:id",                                             jobsController.getOne);
router.patch( "/:id",            validate(updateJobSchema),       jobsController.update);
router.patch( "/:id/status",     validate(updateJobStatusSchema), jobsController.updateStatus);
router.delete("/:id",                                             jobsController.remove);

export default router;