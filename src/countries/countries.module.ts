import { Module } from "@nestjs/common";
import { CountriesController } from "./countries.controller";
import { CountriesService } from "./countries.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [CountriesController],
  providers: [CountriesService, PrismaService, JwtService, ConfigService],
})
export class CountriesModule {}
