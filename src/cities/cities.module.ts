import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CitiesController], // Register the UsersController here
  providers: [CitiesService, PrismaService], // Register the UsersService and PrismaService here
})
export class CitiesModule {}
