/*
  Warnings:

  - You are about to drop the column `cityId` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `priceType` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `yearId` on the `prices` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[city_id,product_id,year_id]` on the table `prices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city_id` to the `prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_type` to the `prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_id` to the `prices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "prices" DROP CONSTRAINT "prices_cityId_fkey";

-- DropForeignKey
ALTER TABLE "prices" DROP CONSTRAINT "prices_productId_fkey";

-- DropForeignKey
ALTER TABLE "prices" DROP CONSTRAINT "prices_yearId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropIndex
DROP INDEX "prices_cityId_productId_yearId_key";

-- AlterTable
ALTER TABLE "prices" DROP COLUMN "cityId",
DROP COLUMN "createdAt",
DROP COLUMN "priceType",
DROP COLUMN "productId",
DROP COLUMN "updatedAt",
DROP COLUMN "yearId",
ADD COLUMN     "city_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price_type" "PriceType" NOT NULL,
ADD COLUMN     "product_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "year_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prices_city_id_product_id_year_id_key" ON "prices"("city_id", "product_id", "year_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
