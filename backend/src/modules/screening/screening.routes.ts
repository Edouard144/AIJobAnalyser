/**
 * @swagger
 * tags:
 *   name: Screening
 *   description: AI-powered candidate screening powered by Google Gemini
 */

/**
 * @swagger
 * /api/jobs/{jobId}/screening/run:
 *   post:
 *     summary: Run AI screening on all candidates for a job
 *     description: |
 *       Triggers Google Gemini AI to evaluate **all candidates** for the given job against
 *       the job's requirements and responsibilities.
 *
 *       Each candidate receives:
 *       - A **score** (0–100)
 *       - A **summary** of their fit
 *       - Identified **strengths** and **weaknesses**
 *       - A **recommendation** (SHORTLIST / CONSIDER / REJECT)
 *
 *       > ⚠️ This is an expensive AI operation. Rate-limited to **5 runs per hour**.
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The job UUID to run screening for
 *         example: 550e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: AI screening completed — results saved and returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScreeningResultsResponse'
 *       400:
 *         description: No candidates found for this job to screen
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
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: AI screening rate limit reached — max 5 per hour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/jobs/{jobId}/screening/results:
 *   get:
 *     summary: Get previously saved AI screening results for a job
 *     description: |
 *       Returns the stored screening results from the most recent AI screening run for this job.
 *       Results are sorted by score (highest first).
 *     tags: [Screening]
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
 *     responses:
 *       200:
 *         description: Screening results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScreeningResultsResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No screening results found — run screening first
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// screening routes
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { screeningController } from "./screening.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router({ mergeParams: true }); // access :jobId from parent

router.use(requireAuth);

// Stricter rate limit for AI screening (expensive operation)
const screeningLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 AI screenings per hour
  message: { success: false, message: "AI screening limit reached, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Trigger AI screening
router.post("/run", screeningLimiter, screeningController.run);

// Fetch saved results
router.get("/results",  screeningController.getResults);

// Generate tailored interview questions
router.get("/candidates/:candidateId/interview-kit", screeningController.generateInterviewKit);

export default router;