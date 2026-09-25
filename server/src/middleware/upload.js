import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WEBP, or AVIF images are allowed"));
    }
    cb(null, true);
  },
});
