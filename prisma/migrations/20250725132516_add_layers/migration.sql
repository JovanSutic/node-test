-- CreateTable
CREATE TABLE "layer_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "layer_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layer" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "layer_type_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "value_string" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "layer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "layer_type_name_key" ON "layer_type"("name");

-- AddForeignKey
ALTER TABLE "layer" ADD CONSTRAINT "layer_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layer" ADD CONSTRAINT "layer_layer_type_id_fkey" FOREIGN KEY ("layer_type_id") REFERENCES "layer_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
