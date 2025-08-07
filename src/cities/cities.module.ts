import { Module } from "@nestjs/common";
import { CitiesController } from "./cities.controller";
import { CitiesService } from "./cities.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, PrismaService, JwtService, ConfigService],
  exports: [CitiesService],
})
export class CitiesModule {}
