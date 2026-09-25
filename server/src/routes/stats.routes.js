import { Router } from "express";
import prisma from "../prisma/client.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const DAYS = 14;

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

router.get("/dashboard", requireAdmin, async (_req, res) => {
  const [totalBikes, activeBikes, featuredBikes, totalEnquiries, newEnquiries, totalBookings, pendingBookings] =
    await Promise.all([
      prisma.bike.count(),
      prisma.bike.count({ where: { isActive: true } }),
      prisma.bike.count({ where: { featured: true } }),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]);

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));
  since.setUTCHours(0, 0, 0, 0);

  const enquiriesByDayRaw = await prisma.$queryRaw`
    SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*)::int AS count
    FROM "Enquiry"
    WHERE "createdAt" >= ${since}
    GROUP BY day
    ORDER BY day ASC
  `;
  const countByDay = new Map(
    enquiriesByDayRaw.map((row) => [row.day.toISOString().slice(0, 10), row.count])
  );
  const enquiriesByDay = lastNDays(DAYS).map((date) => ({ date, count: countByDay.get(date) || 0 }));

  const topBikeGroups = await prisma.enquiry.groupBy({
    by: ["bikeId"],
    where: { bikeId: { not: null } },
    _count: { bikeId: true },
    orderBy: { _count: { bikeId: "desc" } },
    take: 5,
  });
  const topBikeRecords = await prisma.bike.findMany({
    where: { id: { in: topBikeGroups.map((g) => g.bikeId) } },
    select: { id: true, name: true, brand: true },
  });
  const topBikes = topBikeGroups.map((g) => {
    const bike = topBikeRecords.find((b) => b.id === g.bikeId);
    return { bikeId: g.bikeId, name: bike?.name || "Unknown", brand: bike?.brand || "", count: g._count.bikeId };
  });

  const brandGroups = await prisma.bike.groupBy({
    by: ["brand"],
    _count: { brand: true },
    orderBy: { _count: { brand: "desc" } },
  });
  const brandSplit = brandGroups.map((g) => ({ brand: g.brand, count: g._count.brand }));

  res.json({
    totalBikes,
    activeBikes,
    featuredBikes,
    totalEnquiries,
    newEnquiries,
    totalBookings,
    pendingBookings,
    enquiriesByDay,
    topBikes,
    brandSplit,
  });
});

export default router;
