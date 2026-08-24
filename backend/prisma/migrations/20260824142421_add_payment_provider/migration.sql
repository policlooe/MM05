-- AlterTable
ALTER TABLE "orders" ADD COLUMN "payment_provider" TEXT,
ADD COLUMN "provider_payment_id" TEXT;

-- CreateIndex
CREATE INDEX "orders_provider_payment_id_idx" ON "orders"("provider_payment_id");
