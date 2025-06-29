import { Module } from "@nestjs/common";
import { AspectController } from "./aspect.controller";
import { AspectService } from "./aspect.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [AspectController],
  providers: [AspectService, PrismaService, JwtService, ConfigService],
})
export class AspectModule {}
