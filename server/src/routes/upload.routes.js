import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateKey, uploadObject } from "../storage/garage.js";
import { buildFileUrl } from "../utils/publicUrl.js";

const router = Router();

router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }
  try {
    const key = generateKey(req.file.originalname);
    await uploadObject(key, req.file.buffer, req.file.mimetype);
    res.status(201).json({ url: buildFileUrl(key) });
  } catch (err) {
    next(err);
  }
});

export default router;
