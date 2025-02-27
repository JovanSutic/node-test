import { PrismaClient } from "@prisma/client";
import { cities, users } from "./seedData";

const prisma = new PrismaClient();

(async () => {
  try {
    console.log("Seeding the database...");

    const user = await prisma.users.findUnique({ where: { id: 1 } });

    if (!user) {
      await prisma.users.createMany({
        data: users,
      });
    }

    const city = await prisma.cities.findUnique({ where: { id: 1 } });

    if (!city) {
      await prisma.cities.createMany({
        data: cities,
      });
    }

    console.log("Seeding completed");
  } catch (error: any) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
