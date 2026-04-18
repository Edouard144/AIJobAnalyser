/**
 * @swagger
 * /api/jobs/{jobId}/screening/run:
 *   post:
 *     summary: Run AI screening for all candidates in a job
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
 *     responses:
 *       200:
 *         description: Screening completed
 *       400:
 *         description: No candidates to screen
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/jobs/{jobId}/screening/results:
 *   get:
 *     summary: Get screening results for a job
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
 *     responses:
 *       200:
 *         description: Screening results retrieved
 *       404:
 *         description: No results found
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

export default router;