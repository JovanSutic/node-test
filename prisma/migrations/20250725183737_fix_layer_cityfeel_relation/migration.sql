-- RenameForeignKey
ALTER TABLE "city_feel" RENAME CONSTRAINT "city_feel_city_id_fkey" TO "fk_city_feel_city";

-- AddForeignKey
ALTER TABLE "layer" ADD CONSTRAINT "fk_layer_city_feel" FOREIGN KEY ("city_id") REFERENCES "city_feel"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;
