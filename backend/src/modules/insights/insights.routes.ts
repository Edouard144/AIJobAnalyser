/**
 * @swagger
 * tags:
 *   name: Insights
 *   description: Aggregated analytics and statistics for dashboard
 */

import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { insightsController } from "./insights.controller";

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /api/insights/dashboard:
 *   get:
 *     summary: Get all dashboard statistics in one call
 *     description: Returns total jobs, candidates, screenings run, and average match score.
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get("/dashboard", insightsController.getDashboardStats);

/**
 * @swagger
 * /api/insights/activity:
 *   get:
 *     summary: Get screening activity for last 7 days
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily screening counts
 */
router.get("/activity", insightsController.getScreeningActivity);

/**
 * @swagger
 * /api/insights/scores:
 *   get:
 *     summary: Get score distribution across all candidates
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Score distribution by bucket
 */
router.get("/scores", insightsController.getScoreDistribution);

/**
 * @swagger
 * /api/insights/skills:
 *   get:
 *     summary: Get top skills across all candidates
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Most frequently mentioned skills
 */
router.get("/skills", insightsController.getTopSkills);

export default router;
