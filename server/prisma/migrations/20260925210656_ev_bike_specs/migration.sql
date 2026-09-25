-- Replace petrol-specific spec fields with EV spec fields
ALTER TABLE "Bike" DROP COLUMN "engineCC",
DROP COLUMN "mileageKmpl",
DROP COLUMN "transmission",
ADD COLUMN "batteryCapacityKwh" DOUBLE PRECISION,
ADD COLUMN "rangeKm" DOUBLE PRECISION,
ADD COLUMN "chargingTimeHours" DOUBLE PRECISION;
