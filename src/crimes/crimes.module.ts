import { Module } from "@nestjs/common";
import { CrimesController } from "./crimes.controller";
import { CrimesService } from "./crimes.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [CrimesController],
  providers: [CrimesService, PrismaService, JwtService, ConfigService],
})
export class CrimesModule {}
