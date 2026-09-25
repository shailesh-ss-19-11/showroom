import { Router } from "express";
import prisma from "../prisma/client.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

router.post("/", async (req, res) => {
  const { name, phone, email, bikeId, preferredDate, notes } = req.body;
  if (!name || !phone || !preferredDate) {
    return res.status(400).json({ error: "name, phone and preferredDate are required" });
  }
  const date = new Date(preferredDate);
  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ error: "preferredDate must be a valid date" });
  }

  const booking = await prisma.booking.create({
    data: {
      name,
      phone,
      email: email ?? null,
      bikeId: bikeId ?? null,
      preferredDate: date,
      notes: notes ?? null,
    },
  });
  res.status(201).json(booking);
});

router.get("/", requireAdmin, async (req, res) => {
  const { bikeId, status } = req.query;
  const bookings = await prisma.booking.findMany({
    where: {
      ...(bikeId && { bikeId }),
      ...(status && VALID_STATUSES.includes(status) && { status }),
    },
    include: { bike: { select: { id: true, name: true, brand: true } } },
    orderBy: { preferredDate: "asc" },
  });
  res.json(bookings);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  try {
    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: { status } });
    res.json(booking);
  } catch {
    res.status(404).json({ error: "Booking not found" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Booking not found" });
  }
});

export default router;
