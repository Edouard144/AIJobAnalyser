// candidates routes
import { Router } from "express";
import { candidatesController } from "./candidates.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { upload } from "../../utils/upload.utils";

const router = Router({ mergeParams: true }); // mergeParams lets us access :jobId from parent

router.use(requireAuth); // all routes protected

// Scenario 1 — structured JSON bulk insert
router.post("/bulk",       candidatesController.bulkInsert);

// Scenario 2 — CSV file upload
router.post("/upload-csv", upload.single("file"), candidatesController.uploadCSV);

// Standard CRUD
router.get( "/",           candidatesController.getByJob);
router.get( "/:id",        candidatesController.getOne);
router.delete("/:id",      candidatesController.remove);
router.delete("/",         candidatesController.removeAll);

export default router;