import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CLIENT_URL may be a comma-separated list (e.g. localhost + deployed URL).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Also allow this project's Vercel deployments (prod + preview URLs).
const vercelRe = /^https:\/\/ai-study-summarizer[\w-]*\.vercel\.app$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // health checks, curl, server-to-server
  if (allowedOrigins.includes(origin)) return true;
  return vercelRe.test(origin);
}

app.use(
  cors({
    // Never throw here — a thrown error makes the CORS preflight return 500.
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api", studyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start — DB connection error:", err.message);
    process.exit(1);
  });
