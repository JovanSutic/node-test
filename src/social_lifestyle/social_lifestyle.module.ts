import { Module } from "@nestjs/common";
import { SocialLifestyleController } from "./social_lifestyle.controller";
import { SocialLifestyleService } from "./social_lifestyle.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [SocialLifestyleController],
  providers: [SocialLifestyleService, PrismaService, JwtService, ConfigService],
})
export class SocialLifestyleModule {}
