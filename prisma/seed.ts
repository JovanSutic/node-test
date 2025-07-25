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
  countries,
  aspects,
  definitions,
  defValues,
  cityFeels,
  layerTypes,
  layers,
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

    const country = await prisma.categories.findUnique({ where: { id: 1 } });

    if (!category) {
      await prisma.countries.createMany({
        data: countries,
      });
    }

    const city = await prisma.cities.findUnique({ where: { id: 1 } });

    if (!city) {
      await prisma.cities.createMany({
        data: cities,
      });
    }

    const cityFeel = await prisma.city_feel.findUnique({ where: { id: 1 } });

    if (!cityFeel) {
      await prisma.city_feel.createMany({
        data: cityFeels,
      });
    }

    const layer_type = await prisma.layer_type.findUnique({ where: { id: 1 } });

    if (!layer_type) {
      await prisma.layer_type.createMany({
        data: layerTypes,
      });
    }

    const layer = await prisma.layer.findUnique({ where: { id: 1 } });

    if (!layer) {
      await prisma.layer.createMany({
        data: layers,
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

    const aspect = await prisma.aspect.findUnique({ where: { id: 1 } });

    if (!aspect) {
      await prisma.aspect.createMany({
        data: aspects,
      });
    }

    const definition = await prisma.definition.findUnique({ where: { id: 1 } });

    if (!definition) {
      await prisma.definition.createMany({
        data: definitions,
      });
    }

    const defValue = await prisma.def_value.findUnique({ where: { id: 1 } });

    if (!defValue) {
      await prisma.def_value.createMany({
        data: defValues,
      });
    }

    console.log("Seeding completed");
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
