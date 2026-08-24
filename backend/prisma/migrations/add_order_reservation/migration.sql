-- AlterEnum (идемпотентно: значения могут уже существовать)
DO $$
BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE 'NEW';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE 'RESERVED';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

-- AlterTable
ALTER TABLE "orders"
  ALTER COLUMN "user_id" DROP NOT NULL,
  ALTER COLUMN "customer_email" DROP NOT NULL,
  ALTER COLUMN "delivery_address" TYPE TEXT,
  ADD COLUMN IF NOT EXISTS "is_stock_reserved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "reserved_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "options" JSONB DEFAULT '{}';
