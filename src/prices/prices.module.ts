import { Module } from "@nestjs/common";
import { PricesController } from "./prices.controller";
import { PricesService } from "./prices.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [PricesController],
  providers: [PricesService, PrismaService, JwtService, ConfigService],
  exports: [PricesService],
})
export class PricesModule {}
