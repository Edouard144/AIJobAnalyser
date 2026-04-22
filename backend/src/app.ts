import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { db } from "./config/db";
import { users } from "./db/schema/users";
import { errorMiddleware } from "./middleware/error.middleware";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./modules/auth/auth.routes";
import jobRoutes from "./modules/jobs/jobs.routes"; 
import candidateRoutes from "./modules/candidates/candidates.routes";
import screeningRoutes from "./modules/screening/screening.routes";

const app = express();

// Request logging (only in development)
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security headers
app.use(helmet());

// CORS - robust for local development
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV === "development") return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Rate limiting - global limit (disabled for development)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10000, // very high limit for development
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server health check
 *     description: Returns server status and current timestamp. No authentication required.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /health/db:
 *   get:
 *     summary: Database health check
 *     description: Verifies the database connection by running a lightweight query. No authentication required.
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Database connection is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: db ok
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: db error
 *                 message:
 *                   type: string
 */
app.get("/health/db", async (_req, res) => {
  try {
    const result = await db.select().from(users).limit(1);
    res.json({ status: "db ok", result });
  } catch (err: any) {
    res.status(500).json({ status: "db error", message: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes); 
app.use("/api/jobs/:jobId/candidates", candidateRoutes);
app.use("/api/jobs/:jobId/screening", screeningRoutes);

// New feature routes - imported statically
import activityRoutes from "./modules/activity/activity.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import aiRoutes from "./modules/ai/ai.chat.routes";
import teamRoutes from "./modules/team/team.routes";
import billingRoutes from "./modules/billing/billing.routes";

app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/billing", billingRoutes);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;