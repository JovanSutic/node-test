-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "country" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);
