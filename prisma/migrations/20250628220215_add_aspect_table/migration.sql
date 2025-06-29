-- CreateTable
CREATE TABLE "aspect" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "scope" TEXT,

    CONSTRAINT "aspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "definition" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aspect_id" INTEGER NOT NULL,

    CONSTRAINT "definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "def_value" (
    "id" SERIAL NOT NULL,
    "definition_id" INTEGER NOT NULL,
    "city_id" INTEGER,
    "country_id" INTEGER,
    "value" TEXT,
    "score" DOUBLE PRECISION,
    "comment" TEXT,
    "note" TEXT,
    "type" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "def_value_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "definition" ADD CONSTRAINT "definition_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "aspect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "def_value" ADD CONSTRAINT "def_value_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "def_value" ADD CONSTRAINT "def_value_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "def_value" ADD CONSTRAINT "def_value_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
