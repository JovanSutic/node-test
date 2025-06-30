import { Module } from "@nestjs/common";
import { DefinitionController } from "./definition.controller";
import { DefinitionService } from "./definition.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [DefinitionController],
  providers: [DefinitionService, PrismaService, JwtService, ConfigService],
})
export class DefinitionModule {}
