import { Module } from "@nestjs/common";
import { YearsController } from "./years.controller";
import { YearsService } from "./years.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [YearsController],
  providers: [YearsService, PrismaService],
})
export class YearsModule {}
