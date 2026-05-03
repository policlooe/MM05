-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'NEW';
ALTER TYPE "OrderStatus" ADD VALUE 'RESERVED';
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "orders" 
  ALTER COLUMN "user_id" DROP NOT NULL,
  ALTER COLUMN "customer_email" DROP NOT NULL,
  ALTER COLUMN "delivery_address" TYPE TEXT,
  ADD COLUMN "is_stock_reserved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "reserved_at" TIMESTAMP(3),
  ADD COLUMN "completed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "order_items"
  ADD COLUMN "options" JSONB DEFAULT '{}';
