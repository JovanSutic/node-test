-- CreateTable
CREATE TABLE "crime_aspects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crime_aspects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crime_ranks" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "crime_aspect_id" INTEGER NOT NULL,
    "rank" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crime_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crime_aspects_name_key" ON "crime_aspects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crime_ranks_city_id_year_id_crime_aspect_id_key" ON "crime_ranks"("city_id", "year_id", "crime_aspect_id");

-- AddForeignKey
ALTER TABLE "crime_ranks" ADD CONSTRAINT "crime_ranks_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crime_ranks" ADD CONSTRAINT "crime_ranks_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crime_ranks" ADD CONSTRAINT "crime_ranks_crime_aspect_id_fkey" FOREIGN KEY ("crime_aspect_id") REFERENCES "crime_aspects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
