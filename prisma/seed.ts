import { PrismaClient } from "@prisma/client";
import { cities, years, products, categories } from "./seedData";

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

    console.log("Seeding completed");
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
