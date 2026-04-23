/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management per job — bulk JSON insert, CSV upload, and CRUD
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates:
 *   get:
 *     summary: Get all candidates for a job
 *     description: Returns a paginated list of candidates associated with the specified job.
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
 *         description: The job UUID
 *         example: 550e8400-e29b-41d4-a716-446655440001
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Paginated list of candidates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete ALL candidates for a job
 *     description: Permanently removes every candidate associated with the given job. This action is irreversible.
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
 *         description: The job UUID
 *     responses:
 *       200:
 *         description: All candidates deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/bulk:
 *   post:
 *     summary: Bulk insert candidates (JSON)
 *     description: Insert multiple candidates at once from a structured JSON array. Limited to 10 requests per minute.
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
 *         description: The job UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidates
 *             properties:
 *               candidates:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/CandidateInput'
 *           example:
 *             candidates:
 *               - firstName: John
 *                 lastName: Doe
 *                 email: john.doe@example.com
 *                 phone: "+1-555-0100"
 *                 resumeUrl: "https://cdn.example.com/resumes/john-doe.pdf"
 *               - firstName: Jane
 *                 lastName: Smith
 *                 email: jane.smith@example.com
 *     responses:
 *       201:
 *         description: Candidates created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     inserted:
 *                       type: integer
 *                       example: 2
 *                     candidates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many bulk inserts — limited to 10 per minute
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/upload-csv:
 *   post:
 *     summary: Upload candidates via CSV file
 *     description: |
 *       Upload a `.csv` file to import candidates in bulk. The CSV must include these columns:
 *       `firstName`, `lastName`, `email`, `phone` (optional), `resumeUrl` (optional).
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
 *         description: The job UUID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file with candidate data
 *     responses:
 *       201:
 *         description: Candidates imported from CSV successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: integer
 *                       example: 15
 *                     skipped:
 *                       type: integer
 *                       example: 2
 *                       description: Rows skipped due to duplicate emails
 *       400:
 *         description: Invalid or malformed CSV file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/jobs/{jobId}/candidates/{id}:
 *   get:
 *     summary: Get a single candidate by ID
 *     description: Returns the full profile for a specific candidate within a job.
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
 *         description: The job UUID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The candidate UUID
 *     responses:
 *       200:
 *         description: Candidate details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a single candidate
 *     description: Permanently removes a specific candidate from a job.
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
 *         description: The job UUID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The candidate UUID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

// Scenario 3 — PDF resume parsing
router.post("/upload-pdf", upload.single("file"), candidatesController.uploadPDF);

// Standard CRUD
router.get( "/",           validate(paginationSchema), candidatesController.getByJob);
router.get( "/:id",                                  candidatesController.getOne);
router.patch("/:id/status",                         candidatesController.updateStatus);
router.patch("/:id",                                candidatesController.update);
router.delete("/:id",                                candidatesController.remove);
router.delete("/",                                   candidatesController.removeAll);

export default router;