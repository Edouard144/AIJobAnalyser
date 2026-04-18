import dotenv from "dotenv";
dotenv.config();

// Validates all required env variables at startup
// App crashes immediately if anything is missing — better than silent bugs
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

// Crash early if secrets are missing
const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "GEMINI_API_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}