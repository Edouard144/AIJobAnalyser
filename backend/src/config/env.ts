import dotenv from "dotenv";
dotenv.config();

// Validates all required env variables at startup
// App crashes immediately if anything is missing — better than silent bugs
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  GROQ_API_KEY: process.env.GROQ_API_KEY || "gsk_...",
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID || "gen-lang-client-0278212233",
  GCP_LOCATION: process.env.GCP_LOCATION || "us-central1",
  // Email SMTP credentials
  SMTP_USER: process.env.SMTP_USER || "airecruit@gmail.com",
  SMTP_PASS: process.env.SMTP_PASS || "xuty phda dtvl mctn",
};

// Crash early if secrets are missing
const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}