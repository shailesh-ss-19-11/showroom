import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import prisma from "./prisma/client.js";
import { swaggerSpec } from "./swagger.js";
import { getObject, checkBucketHealth } from "./storage/garage.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admins.routes.js";
import bikeRoutes from "./routes/bikes.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import enquiryRoutes from "./routes/enquiries.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) send no Origin header — allow them.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In dev, the frontend's port shifts whenever another project already holds 5173+.
      if (!isProduction && localhostPattern.test(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/uploads/:key", async (req, res) => {
  try {
    const object = await getObject(req.params.key);
    res.setHeader("Content-Type", object.ContentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    object.Body.pipe(res);
  } catch (err) {
    if (err.name === "NoSuchKey") return res.status(404).json({ error: "Image not found" });
    res.status(502).json({ error: "Failed to fetch image" });
  }
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: "Revolt Motors API Docs" }));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.get("/api/health", async (_req, res) => {
  const result = { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.db = "up";
  } catch (err) {
    result.db = "down";
    result.dbError = err.message;
  }

  try {
    await checkBucketHealth();
    result.storage = "up";
  } catch (err) {
    result.storage = "down";
    result.storageError = err.message;
  }

  if (result.db === "down" || result.storage === "down") {
    result.status = "error";
    return res.status(503).json(result);
  }

  res.json(result);
});

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/bikes", bikeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Showroom API listening on http://localhost:${PORT}`);
});
