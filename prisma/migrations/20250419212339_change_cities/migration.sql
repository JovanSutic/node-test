/*
  Warnings:

  - You are about to drop the column `numbeo_id` on the `cities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cities" DROP COLUMN "numbeo_id",
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "search" TEXT,
ADD COLUMN     "seaside" BOOLEAN;
