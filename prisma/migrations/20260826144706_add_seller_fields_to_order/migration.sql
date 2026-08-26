-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pan_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seller_id" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "seller_type" TEXT NOT NULL DEFAULT 'unknown';
