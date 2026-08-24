-- Add product configuration JSON used by configurable catalog items.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "configuration" JSONB DEFAULT '{}';
