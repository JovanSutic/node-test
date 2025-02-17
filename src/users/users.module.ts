import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController], // Register the UsersController here
  providers: [UsersService, PrismaService], // Register the UsersService and PrismaService here
})
export class UsersModule {}
