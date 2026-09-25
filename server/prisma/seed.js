import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    console.log("Admins already exist, skipping owner seed.");
    return;
  }

  const name = process.env.ADMIN_NAME || "Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@varexa.in").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const admin = await prisma.admin.create({
    data: { name, email, password: await bcrypt.hash(password, 10), role: "OWNER" },
  });
  console.log(`Created owner admin ${admin.email}`);
}

async function seedBike() {
  const bikeCount = await prisma.bike.count();
  if (bikeCount > 0) {
    console.log("Bikes already exist, skipping sample data.");
    return;
  }

  const bike = await prisma.bike.create({
    data: {
      name: "RV400",
      brand: "Revolt",
      category: "Sport",
      price: 128900,
      batteryCapacityKwh: 3.24,
      rangeKm: 150,
      chargingTimeHours: 4.5,
      topSpeedKmph: 85,
      power: "3 kW BLDC motor",
      description: "An AI-enabled electric motorcycle with swappable battery and app-based customization.",
      featured: true,
      colors: {
        create: [
          { name: "Metallic Black", hexCode: "#1a1a1a" },
          { name: "Racing Blue", hexCode: "#1e3a8a" },
        ],
      },
    },
  });
  console.log(`Created sample bike ${bike.name}`);
}

async function main() {
  await seedAdmin();
  await seedBike();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
