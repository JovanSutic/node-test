/*
  Warnings:

  - You are about to drop the column `additional_data` on the `report` table. All the data in the column will be lost.
  - You are about to drop the `report_cost_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."report_cost_item" DROP CONSTRAINT "report_cost_item_report_id_fkey";

-- AlterTable
ALTER TABLE "public"."report" DROP COLUMN "additional_data";

-- DropTable
DROP TABLE "public"."report_cost_item";

-- CreateTable
CREATE TABLE "public"."report_items" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "income_maker" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_items_report_id_income_maker_idx" ON "public"."report_items"("report_id", "income_maker");

-- AddForeignKey
ALTER TABLE "public"."report_items" ADD CONSTRAINT "report_items_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
