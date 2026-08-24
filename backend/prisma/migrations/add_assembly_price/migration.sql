-- Add assembly price column
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "assembly_price" DECIMAL(10,2);
