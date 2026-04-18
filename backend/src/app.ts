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

// CORS - restrict to frontend URL
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting - global limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;