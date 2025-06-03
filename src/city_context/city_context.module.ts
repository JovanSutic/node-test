import { Module } from "@nestjs/common";
import { CityContextController } from "./city_context.controller";
import { CityContextService } from "./city_context.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [CityContextController],
  providers: [CityContextService, PrismaService, JwtService, ConfigService],
})
export class CityContextModule {}
