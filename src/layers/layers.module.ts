import { Module } from "@nestjs/common";
import { LayersController } from "./layers.controller";
import { LayersService } from "./layers.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [LayersController],
  providers: [LayersService, PrismaService, JwtService, ConfigService],
})
export class LayersModule {}
