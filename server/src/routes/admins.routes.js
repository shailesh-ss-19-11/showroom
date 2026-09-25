import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import { requireAdmin, requireOwner } from "../middleware/auth.js";

const router = Router();

const adminSelect = { id: true, name: true, email: true, role: true, createdAt: true };

router.use(requireAdmin, requireOwner);

router.get("/", async (_req, res) => {
  const admins = await prisma.admin.findMany({ select: adminSelect, orderBy: { createdAt: "asc" } });
  res.json(admins);
});

router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const hashed = await bcrypt.hash(password, 10);
  try {
    const admin = await prisma.admin.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashed,
        role: role === "OWNER" ? "OWNER" : "STAFF",
      },
      select: adminSelect,
    });
    res.status(201).json(admin);
  } catch {
    res.status(409).json({ error: "An admin with this email already exists" });
  }
});

router.patch("/:id/role", async (req, res) => {
  const { role } = req.body;
  if (role !== "OWNER" && role !== "STAFF") {
    return res.status(400).json({ error: "role must be OWNER or STAFF" });
  }
  if (req.params.id === req.admin.id && role !== "OWNER") {
    return res.status(400).json({ error: "You cannot demote yourself" });
  }
  try {
    const admin = await prisma.admin.update({ where: { id: req.params.id }, data: { role }, select: adminSelect });
    res.json(admin);
  } catch {
    res.status(404).json({ error: "Admin not found" });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.params.id === req.admin.id) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }
  try {
    await prisma.admin.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Admin not found" });
  }
});

export default router;
