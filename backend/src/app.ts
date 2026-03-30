import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import jobRoutes from "./modules/jobs/jobs.routes"; 
import candidateRoutes from "./modules/candidates/candidates.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes); 
app.use("/api/jobs/:jobId/candidates", candidateRoutes);
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;