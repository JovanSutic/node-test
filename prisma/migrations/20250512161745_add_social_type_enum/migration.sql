-- CreateEnum
CREATE TYPE "SocialType" AS ENUM ('SOLO', 'PAIR', 'FAMILY');

-- AlterTable
ALTER TABLE "city_social_lifestyle_report" ADD COLUMN     "type" "SocialType";
