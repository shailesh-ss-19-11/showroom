import { Router } from "express";
import prisma from "../prisma/client.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

function toCsvField(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

router.post("/", async (req, res) => {
  const { name, phone, email, message, bikeId, source } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "name and phone are required" });
  }
  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      phone,
      email: email ?? null,
      message: message ?? null,
      bikeId: bikeId ?? null,
      source: source ?? "contact",
    },
  });
  res.status(201).json(enquiry);
});

router.get("/export", requireAdmin, async (req, res) => {
  const { bikeId, status } = req.query;
  const enquiries = await prisma.enquiry.findMany({
    where: {
      ...(bikeId && { bikeId }),
      ...(status && VALID_STATUSES.includes(status) && { status }),
    },
    include: { bike: { select: { name: true, brand: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Name", "Phone", "Email", "Bike", "Message", "Source", "Status", "Date"];
  const rows = enquiries.map((e) => [
    e.name,
    e.phone,
    e.email || "",
    e.bike ? `${e.bike.brand} ${e.bike.name}` : "",
    e.message || "",
    e.source,
    e.status,
    e.createdAt.toISOString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map(toCsvField).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="enquiries-${Date.now()}.csv"`);
  res.send(csv);
});

router.get("/", requireAdmin, async (req, res) => {
  const { bikeId, status } = req.query;
  const enquiries = await prisma.enquiry.findMany({
    where: {
      ...(bikeId && { bikeId }),
      ...(status && VALID_STATUSES.includes(status) && { status }),
    },
    include: { bike: { select: { id: true, name: true, brand: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(enquiries);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  try {
    const enquiry = await prisma.enquiry.update({ where: { id: req.params.id }, data: { status } });
    res.json(enquiry);
  } catch {
    res.status(404).json({ error: "Enquiry not found" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.enquiry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Enquiry not found" });
  }
});

export default router;
