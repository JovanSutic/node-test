import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, JwtService, ConfigService],
})
export class ProductsModule {}
