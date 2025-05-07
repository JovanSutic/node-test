-- CreateTable
CREATE TABLE "city_social_lifestyle_report" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "avg_price" DOUBLE PRECISION,
    "currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_social_lifestyle_report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "city_social_lifestyle_report" ADD CONSTRAINT "city_social_lifestyle_report_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_social_lifestyle_report" ADD CONSTRAINT "city_social_lifestyle_report_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
