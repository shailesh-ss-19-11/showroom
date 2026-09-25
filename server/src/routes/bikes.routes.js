import { Router } from "express";
import { requireAdmin, optionalAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  listBikes,
  getBike,
  getMeta,
  createBike,
  updateBike,
  deleteBike,
  addColor,
  deleteColor,
  addImage,
  deleteImage,
  reorderImages,
  bulkUpdateBikes,
  duplicateBike,
} from "../controllers/bikes.controller.js";

const router = Router();

router.get("/meta", getMeta);
router.get("/", optionalAdmin, listBikes);
router.patch("/bulk", requireAdmin, bulkUpdateBikes);
router.get("/:id", optionalAdmin, getBike);

router.post("/", requireAdmin, upload.array("images", 10), createBike);
router.put("/:id", requireAdmin, updateBike);
router.delete("/:id", requireAdmin, deleteBike);
router.post("/:id/duplicate", requireAdmin, duplicateBike);

router.post("/:id/colors", requireAdmin, addColor);
router.delete("/:id/colors/:colorId", requireAdmin, deleteColor);

router.post("/:id/images", requireAdmin, addImage);
router.patch("/:id/images/reorder", requireAdmin, reorderImages);
router.delete("/:id/images/:imageId", requireAdmin, deleteImage);

export default router;
