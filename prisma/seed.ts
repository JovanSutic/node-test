import { PrismaClient } from "@prisma/client";
import {
  cities,
  years,
  products,
  categories,
  prices,
  socialLifeStyleReports,
  crimeAspects,
  crimeRanks,
  weathers,
} from "./seedData";

const prisma = new PrismaClient();

(async () => {
  try {
    console.log("Seeding the database...");

    const category = await prisma.categories.findUnique({ where: { id: 1 } });

    if (!category) {
      await prisma.categories.createMany({
        data: categories,
      });
    }

    const city = await prisma.cities.findUnique({ where: { id: 1 } });

    if (!city) {
      await prisma.cities.createMany({
        data: cities,
      });
    }

    const year = await prisma.years.findUnique({ where: { id: 1 } });

    if (!year) {
      await prisma.years.createMany({
        data: years,
      });
    }

    const product = await prisma.products.findUnique({ where: { id: 1 } });

    if (!product) {
      await prisma.products.createMany({
        data: products,
      });
    }

    const price = await prisma.prices.findUnique({ where: { id: 1 } });

    if (!price) {
      await prisma.prices.createMany({
        data: prices,
      });
    }

    const social_lifestyle =
      await prisma.city_social_lifestyle_report.findUnique({
        where: { id: 1 },
      });

    if (!social_lifestyle) {
      await prisma.city_social_lifestyle_report.createMany({
        data: socialLifeStyleReports,
      });
    }

    const crimeAspect = await prisma.crime_aspects.findUnique({
      where: { id: 1 },
    });

    if (!crimeAspect) {
      await prisma.crime_aspects.createMany({
        data: crimeAspects,
      });
    }

    const crimeRank = await prisma.crime_ranks.findUnique({ where: { id: 1 } });

    if (!crimeRank) {
      await prisma.crime_ranks.createMany({
        data: crimeRanks,
      });
    }

    const weathersUnit = await prisma.weathers.findUnique({ where: { id: 1 } });

    if (!weathersUnit) {
      await prisma.weathers.createMany({
        data: weathers,
      });
    }

    console.log("Seeding completed");
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
