-- CreateTable
CREATE TABLE "city_context" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "climate" TEXT NOT NULL,
    "tourism_level" TEXT NOT NULL,
    "expat_community" TEXT NOT NULL,
    "nature_access" TEXT NOT NULL,
    "local_lifestyle" TEXT NOT NULL,
    "seasonality" TEXT NOT NULL,
    "culture_highlights" TEXT NOT NULL,
    "sports_and_activities" TEXT NOT NULL,
    "detailed_story" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expat_tip" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expat_tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_feel" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "tags" TEXT,
    "budget" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_feel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "city_context_city_id_idx" ON "city_context"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_context_city_id_key" ON "city_context"("city_id");

-- CreateIndex
CREATE INDEX "expat_tip_city_id_idx" ON "expat_tip"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_feel_city_id_key" ON "city_feel"("city_id");

-- AddForeignKey
ALTER TABLE "city_context" ADD CONSTRAINT "city_context_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expat_tip" ADD CONSTRAINT "expat_tip_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_feel" ADD CONSTRAINT "city_feel_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
