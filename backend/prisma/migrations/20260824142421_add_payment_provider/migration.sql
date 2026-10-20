-- AlterTable
-- IF NOT EXISTS обязателен: прод-база инициализирована `prisma db push`, и эти
-- колонки там уже есть. Без этого `prisma migrate deploy` падал с 42701 и
-- блокировал все последующие миграции (P3009).
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_provider" TEXT,
ADD COLUMN IF NOT EXISTS "provider_payment_id" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_provider_payment_id_idx" ON "orders"("provider_payment_id");
