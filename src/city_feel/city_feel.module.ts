import { Module } from "@nestjs/common";
import { CityFeelController } from "./city_feel.controller";
import { CityFeelService } from "./city_feel.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [CityFeelController],
  providers: [CityFeelService, PrismaService, JwtService, ConfigService],
})
export class CityFeelModule {}
