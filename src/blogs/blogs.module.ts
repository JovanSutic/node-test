import { Module } from "@nestjs/common";
import { BlogController } from "./blogs.controller";
import { BlogService } from "./blogs.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [BlogController],
  providers: [BlogService, PrismaService, JwtService, ConfigService],
})
export class BlogsModule {}
