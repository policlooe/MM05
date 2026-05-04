# Apply Assembly Price Migration

## Overview
This guide explains how to apply the database migration that adds the `assemblyPrice` field to the Product table.

## Migration Details

**Migration Name**: `add_assembly_price`
**Location**: `backend/prisma/migrations/add_assembly_price/migration.sql`

**Changes**:
- Adds `assemblyPrice` column to `Product` table
- Type: `INTEGER` (stores price in kopecks)
- Nullable: `YES` (optional field)

## Prerequisites

1. Backend server must be stopped
2. Database connection must be available
3. `.env` file must have correct `DATABASE_URL`

## Steps to Apply Migration

### Option 1: Using Prisma Migrate (Recommended)

```bash
# Navigate to backend directory
cd backend

# Apply the migration
npx prisma migrate deploy

# Verify migration was applied
npx prisma migrate status
```

### Option 2: Manual SQL Execution

If you prefer to apply the migration manually:

```bash
# Connect to your database
psql $DATABASE_URL

# Run the migration SQL
ALTER TABLE "Product" ADD COLUMN "assemblyPrice" INTEGER;

# Verify the column was added
\d "Product"
```

## Verification

After applying the migration, verify it worked:

```bash
# Generate Prisma Client with new schema
cd backend
npx prisma generate

# Check the database schema
npx prisma db pull
```

## Updating Existing Products

If you want to set assembly prices for existing products:

```sql
-- Example: Set assembly prices for existing products
UPDATE "Product" SET "assemblyPrice" = 350000 WHERE "slug" = 'krovat-almak';
UPDATE "Product" SET "assemblyPrice" = 450000 WHERE "slug" = 'shkaf-terek';
UPDATE "Product" SET "assemblyPrice" = 200000 WHERE "slug" = 'stol-sulak';
UPDATE "Product" SET "assemblyPrice" = 150000 WHERE "slug" = 'kreslo-kachalka-kaspiy';
UPDATE "Product" SET "assemblyPrice" = 1500000 WHERE "slug" = 'besedka-hunzakh';
UPDATE "Product" SET "assemblyPrice" = 100000 WHERE "slug" = 'tumba-gunib';
UPDATE "Product" SET "assemblyPrice" = 300000 WHERE "slug" = 'krovat-andiyka';
UPDATE "Product" SET "assemblyPrice" = 150000 WHERE "slug" = 'stol-pismenny-akhty';
```

**Note**: Prices are in kopecks (multiply rubles by 100)
- 3,500 ₽ = 350000 kopecks
- 4,500 ₽ = 450000 kopecks
- etc.

## Rollback (If Needed)

If you need to rollback the migration:

```sql
ALTER TABLE "Product" DROP COLUMN "assemblyPrice";
```

Or using Prisma:

```bash
# This will rollback the last migration
npx prisma migrate resolve --rolled-back add_assembly_price
```

## Testing After Migration

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the API**:
   ```bash
   # Get a product and check if assemblyPrice is present
   curl http://localhost:5000/api/products/krovat-almak
   ```

3. **Test order creation**:
   - Add a product with assembly to cart
   - Complete checkout
   - Verify order includes assembly data

4. **Check admin panel**:
   - Login to admin panel
   - Navigate to Products
   - Verify "Сборка" column shows prices

## Troubleshooting

### Migration Already Applied
If you see "Migration already applied", the migration is already in your database. No action needed.

### Connection Error
If you get a connection error:
1. Check `DATABASE_URL` in `.env`
2. Verify database is running
3. Check network connectivity

### Permission Error
If you get a permission error:
1. Verify database user has ALTER TABLE permissions
2. Check if you're using the correct database credentials

## Environment-Specific Instructions

### Development (Local)
```bash
cd backend
npx prisma migrate deploy
```

### Production (Railway)
```bash
# Railway will automatically apply migrations on deploy
# Or manually via Railway CLI:
railway run npx prisma migrate deploy
```

### Staging (Supabase)
```bash
# Connect to Supabase database
cd backend
DATABASE_URL="your-supabase-connection-string" npx prisma migrate deploy
```

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] Prisma Client regenerated
- [ ] Backend server starts without errors
- [ ] Products API returns assemblyPrice field
- [ ] Admin panel shows assembly column
- [ ] Order creation includes assembly data
- [ ] Invoice displays assembly line item

## Support

If you encounter issues:
1. Check backend logs: `npm run dev` in backend directory
2. Verify Prisma schema matches database: `npx prisma db pull`
3. Regenerate Prisma Client: `npx prisma generate`

---

**Created**: 2026-05-04
**Status**: Ready to apply
