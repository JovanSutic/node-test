-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('ALL', 'HISTORICAL', 'CURRENT');

-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "bottom" DOUBLE PRECISION,
ADD COLUMN     "top" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "type" "ProductType";
