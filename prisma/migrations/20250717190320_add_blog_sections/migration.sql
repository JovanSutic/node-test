-- CreateTable
CREATE TABLE "blogs" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER,
    "country_id" INTEGER,
    "slug" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_sections" (
    "id" SERIAL NOT NULL,
    "blog_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_sections_blog_id_idx" ON "blog_sections"("blog_id");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_sections" ADD CONSTRAINT "blog_sections_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
