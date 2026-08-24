-- Система доставки: метод, координаты точки B, параметры маршрута.
-- Идемпотентно для существующей БД (Supabase) и безопасно для чистой.

-- CreateEnum
DO $$
BEGIN
    CREATE TYPE "DeliveryMethod" AS ENUM ('PICKUP', 'COURIER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- AlterTable
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'PICKUP',
  ADD COLUMN IF NOT EXISTS "delivery_lat" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "delivery_lng" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "delivery_distance_km" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "delivery_duration_min" INTEGER;
