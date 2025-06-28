-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "countries_id" INTEGER;

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
