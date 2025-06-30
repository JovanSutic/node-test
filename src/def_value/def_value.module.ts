import { Module } from "@nestjs/common";
import { DefValueController } from "./def_value.controller";
import { DefValueService } from "./def_value.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [DefValueController],
  providers: [DefValueService, PrismaService, JwtService, ConfigService],
})
export class DefValueModule {}
