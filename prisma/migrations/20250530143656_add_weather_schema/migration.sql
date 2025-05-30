-- CreateTable
CREATE TABLE "weathers" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "sunshine" INTEGER NOT NULL,
    "rain" INTEGER NOT NULL,
    "cold" INTEGER NOT NULL,
    "heat" INTEGER NOT NULL,
    "cold_extremes" INTEGER NOT NULL,
    "heat_extremes" INTEGER NOT NULL,
    "humidity" INTEGER NOT NULL,
    "severe" TEXT NOT NULL,
    "lowest" INTEGER NOT NULL,
    "highest" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weathers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weathers_city_id_key" ON "weathers"("city_id");

-- AddForeignKey
ALTER TABLE "weathers" ADD CONSTRAINT "weathers_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
