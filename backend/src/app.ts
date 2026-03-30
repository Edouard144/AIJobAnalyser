// express app setup
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";

// Route imports (we'll add more as we build each module)
import authRoutes from "./modules/auth/auth.routes";

const app = express();

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet());                          // sets secure HTTP headers
app.use(cors({ origin: "*" }));            // allow frontend to call this API
app.use(express.json());                   // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// ─── Health Check ─────────────────────────────────────────────────────────────
// Judges and deployment platforms hit this to confirm the server is alive
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;