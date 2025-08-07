-- CreateTable
CREATE TABLE "public"."report" (
    "id" SERIAL NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "save" DOUBLE PRECISION NOT NULL,
    "expenses_low" DOUBLE PRECISION NOT NULL,
    "expenses_comfort" DOUBLE PRECISION NOT NULL,
    "type" "public"."SocialType" NOT NULL,
    "user_data" JSONB NOT NULL,
    "additional_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_cost_item" (
    "id" SERIAL NOT NULL,
    "report_id" INTEGER NOT NULL,
    "income_maker" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_cost_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_cost_item_report_id_income_maker_idx" ON "public"."report_cost_item"("report_id", "income_maker");

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cost_item" ADD CONSTRAINT "report_cost_item_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
