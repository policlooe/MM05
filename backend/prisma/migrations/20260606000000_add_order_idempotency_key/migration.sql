-- Add a stable idempotency key for order creation dedupe.
-- Идемпотентно: колонка может уже существовать в проде (Supabase)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotency_key" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotency_key_key" ON "orders"("idempotency_key");
