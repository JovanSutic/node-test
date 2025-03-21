import { Module } from "@nestjs/common";
import { YearsController } from "./years.controller";
import { YearsService } from "./years.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [YearsController],
  providers: [YearsService, PrismaService, JwtService, ConfigService],
})
export class YearsModule {}
