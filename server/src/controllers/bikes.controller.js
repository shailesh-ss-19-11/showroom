import prisma from "../prisma/client.js";
import { generateKey, uploadObject, deleteObject, keyFromUrl } from "../storage/garage.js";
import { buildFileUrl } from "../utils/publicUrl.js";

const bikeInclude = {
  colors: true,
  images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
};

export async function listBikes(req, res) {
  const { brand, category, search, minPrice, maxPrice, featured, sort, status } = req.query;

  const where = {};
  if (req.admin) {
    if (status === "active") where.isActive = true;
    else if (status === "inactive") where.isActive = false;
    // status === "all" (or omitted) for an admin means no isActive filter.
  } else {
    where.isActive = true;
  }
  if (brand) where.brand = { equals: brand, mode: "insensitive" };
  if (category) where.category = { equals: category, mode: "insensitive" };
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const bikes = await prisma.bike.findMany({ where, include: bikeInclude, orderBy });
  res.json(bikes);
}

export async function getBike(req, res) {
  const bike = await prisma.bike.findUnique({
    where: { id: req.params.id },
    include: bikeInclude,
  });
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  if (!bike.isActive && !req.admin) return res.status(404).json({ error: "Bike not found" });
  res.json(bike);
}

export async function getMeta(_req, res) {
  const bikes = await prisma.bike.findMany({
    where: { isActive: true },
    select: { brand: true, category: true },
  });
  const brands = [...new Set(bikes.map((b) => b.brand))].sort();
  const categories = [...new Set(bikes.map((b) => b.category))].sort();
  res.json({ brands, categories });
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toBoolean(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

export async function createBike(req, res, next) {
  const {
    name,
    brand,
    category,
    price,
    batteryCapacityKwh,
    rangeKm,
    chargingTimeHours,
    topSpeedKmph,
    power,
    description,
    featured,
  } = req.body;

  if (!name || !brand || !category || price === undefined || price === "") {
    return res.status(400).json({ error: "name, brand, category and price are required" });
  }

  const files = req.files || [];

  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const key = generateKey(file.originalname);
        await uploadObject(key, file.buffer, file.mimetype);
        return buildFileUrl(key);
      })
    );

    const bike = await prisma.bike.create({
      data: {
        name,
        brand,
        category,
        price: toNumberOrNull(price),
        batteryCapacityKwh: toNumberOrNull(batteryCapacityKwh),
        rangeKm: toNumberOrNull(rangeKm),
        chargingTimeHours: toNumberOrNull(chargingTimeHours),
        topSpeedKmph: toNumberOrNull(topSpeedKmph),
        power: power ?? null,
        description: description ?? null,
        featured: toBoolean(featured),
        images: {
          create: uploaded.map((url, index) => ({
            url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
      include: bikeInclude,
    });
    res.status(201).json(bike);
  } catch (err) {
    next(err);
  }
}

export async function updateBike(req, res) {
  const {
    name,
    brand,
    category,
    price,
    batteryCapacityKwh,
    rangeKm,
    chargingTimeHours,
    topSpeedKmph,
    power,
    description,
    featured,
    isActive,
  } = req.body;

  try {
    const bike = await prisma.bike.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price }),
        ...(batteryCapacityKwh !== undefined && { batteryCapacityKwh }),
        ...(rangeKm !== undefined && { rangeKm }),
        ...(chargingTimeHours !== undefined && { chargingTimeHours }),
        ...(topSpeedKmph !== undefined && { topSpeedKmph }),
        ...(power !== undefined && { power }),
        ...(description !== undefined && { description }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: bikeInclude,
    });
    res.json(bike);
  } catch {
    res.status(404).json({ error: "Bike not found" });
  }
}

export async function deleteBike(req, res) {
  try {
    const bike = await prisma.bike.delete({
      where: { id: req.params.id },
      include: { images: true },
    });
    await Promise.all(
      bike.images.map((img) => {
        const key = keyFromUrl(img.url);
        return key
          ? deleteObject(key).catch((err) => console.error("Failed to delete object from Garage:", err.message))
          : Promise.resolve();
      })
    );
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Bike not found" });
  }
}

export async function addColor(req, res) {
  const { name, hexCode } = req.body;
  if (!name || !hexCode) {
    return res.status(400).json({ error: "name and hexCode are required" });
  }
  const color = await prisma.bikeColor.create({
    data: { name, hexCode, bikeId: req.params.id },
  });
  res.status(201).json(color);
}

export async function deleteColor(req, res) {
  try {
    await prisma.bikeColor.delete({ where: { id: req.params.colorId } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Color not found" });
  }
}

export async function addImage(req, res) {
  const { url, colorId, isPrimary } = req.body;
  if (!url) return res.status(400).json({ error: "url is required" });

  if (isPrimary) {
    await prisma.bikeImage.updateMany({
      where: { bikeId: req.params.id },
      data: { isPrimary: false },
    });
  }

  const imageCount = await prisma.bikeImage.count({ where: { bikeId: req.params.id } });

  const image = await prisma.bikeImage.create({
    data: {
      url,
      colorId: colorId ?? null,
      isPrimary: Boolean(isPrimary),
      sortOrder: imageCount,
      bikeId: req.params.id,
    },
  });
  res.status(201).json(image);
}

export async function reorderImages(req, res) {
  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ error: "order must be a non-empty array of image ids" });
  }

  await prisma.$transaction(
    order.map((imageId, index) =>
      prisma.bikeImage.updateMany({
        where: { id: imageId, bikeId: req.params.id },
        data: { sortOrder: index },
      })
    )
  );

  const bike = await prisma.bike.findUnique({ where: { id: req.params.id }, include: bikeInclude });
  if (!bike) return res.status(404).json({ error: "Bike not found" });
  res.json(bike);
}

const BULK_ACTIONS = {
  feature: { featured: true },
  unfeature: { featured: false },
  publish: { isActive: true },
  unpublish: { isActive: false },
};

export async function bulkUpdateBikes(req, res) {
  const { ids, action } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array" });
  }

  if (action === "delete") {
    const bikes = await prisma.bike.findMany({ where: { id: { in: ids } }, include: { images: true } });
    await prisma.bike.deleteMany({ where: { id: { in: ids } } });
    await Promise.all(
      bikes.flatMap((bike) =>
        bike.images.map((img) => {
          const key = keyFromUrl(img.url);
          return key
            ? deleteObject(key).catch((err) => console.error("Failed to delete object from Garage:", err.message))
            : Promise.resolve();
        })
      )
    );
    return res.json({ updated: bikes.length });
  }

  const data = BULK_ACTIONS[action];
  if (!data) {
    return res.status(400).json({ error: `action must be one of ${[...Object.keys(BULK_ACTIONS), "delete"].join(", ")}` });
  }

  const result = await prisma.bike.updateMany({ where: { id: { in: ids } }, data });
  res.json({ updated: result.count });
}

export async function duplicateBike(req, res) {
  const original = await prisma.bike.findUnique({ where: { id: req.params.id }, include: { colors: true } });
  if (!original) return res.status(404).json({ error: "Bike not found" });

  const copy = await prisma.bike.create({
    data: {
      name: `${original.name} (Copy)`,
      brand: original.brand,
      category: original.category,
      price: original.price,
      batteryCapacityKwh: original.batteryCapacityKwh,
      rangeKm: original.rangeKm,
      chargingTimeHours: original.chargingTimeHours,
      topSpeedKmph: original.topSpeedKmph,
      power: original.power,
      description: original.description,
      featured: false,
      isActive: false,
      colors: {
        create: original.colors.map((c) => ({ name: c.name, hexCode: c.hexCode })),
      },
    },
    include: bikeInclude,
  });
  res.status(201).json(copy);
}

export async function deleteImage(req, res) {
  try {
    const image = await prisma.bikeImage.delete({ where: { id: req.params.imageId } });
    const key = keyFromUrl(image.url);
    if (key) {
      await deleteObject(key).catch((err) => console.error("Failed to delete object from Garage:", err.message));
    }
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Image not found" });
  }
}
