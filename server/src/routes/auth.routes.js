import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(admin);
  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  });
});

router.get("/me", requireAdmin, async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  res.json({ admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});

export default router;
