/*
  Warnings:

  - Made the column `name` on table `cities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `cities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "numbeo_id" INTEGER,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL;
