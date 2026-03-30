// multer config
import multer from "multer";
import path from "path";

// Store files in memory (buffer) — no disk needed, faster, cleaner
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [".csv", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);  // accept
  } else {
    cb(new Error("Only CSV and PDF files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});