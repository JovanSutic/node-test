import { Module } from "@nestjs/common";
import { WeathersController } from "./weathers.controller";
import { WeathersService } from "./weathers.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [WeathersController],
  providers: [WeathersService, PrismaService, JwtService, ConfigService],
})
export class WeathersModule {}
