/**
 * @swagger
 * /api/jobs/{jobId}/candidates:
 *   get:
 *     summary: Get candidates for a job
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of candidates retrieved
 *   post:
 *     summary: Bulk insert candidates
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               candidates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     phone:
 *                       type: string
 *                     resumeUrl:
 *                       type: string
 *     responses:
 *       201:
 *         description: Candidates created successfully
 *       400:
 *         description: Validation error
 *   delete:
 *     summary: Delete all candidates for a job
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Candidates deleted
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/upload-csv:
 *   post:
 *     summary: Upload candidates via CSV
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidates imported successfully
 *       400:
 *         description: Invalid CSV file
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/{id}:
 *   get:
 *     summary: Get a candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Candidate details retrieved
 *       404:
 *         description: Candidate not found
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Candidate deleted
 *       404:
 *         description: Candidate not found
 */

// candidates routes
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { candidatesController } from "./candidates.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { upload } from "../../utils/upload.utils";
import { bulkCandidatesSchema, paginationSchema } from "./candidates.schema";

const router = Router({ mergeParams: true }); // mergeParams lets us access :jobId from parent

router.use(requireAuth); // all routes protected

// Stricter rate limit for bulk operations
const bulkInsertLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 bulk inserts per minute
  message: { success: false, message: "Too many bulk inserts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Scenario 1 — structured JSON bulk insert
router.post("/bulk", bulkInsertLimiter, validate(bulkCandidatesSchema), candidatesController.bulkInsert);

// Scenario 2 — CSV file upload
router.post("/upload-csv", upload.single("file"), candidatesController.uploadCSV);

// Standard CRUD
router.get( "/",           validate(paginationSchema), candidatesController.getByJob);
router.get( "/:id",                                  candidatesController.getOne);
router.delete("/:id",                                candidatesController.remove);
router.delete("/",                                   candidatesController.removeAll);

export default router;