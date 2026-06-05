-- Add product configuration JSON used by configurable catalog items.
ALTER TABLE "products" ADD COLUMN "configuration" JSONB DEFAULT '{}';
