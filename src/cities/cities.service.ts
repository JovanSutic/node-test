import {
    BadRequestException,
    Injectable,
  } from "@nestjs/common";
  import { PrismaService } from "../prisma/prisma.service";
  import { CreateCityDto } from "./cities.dto";
  
  @Injectable()
  export class CitiesService {
    constructor(private readonly prisma: PrismaService) {}
  
    async create(createCityDto: CreateCityDto) {
      const { name, country } = createCityDto;
  
      try {
        return await this.prisma.cities.create({
          data: {
            name,
            country
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the city in the database"
        );
      }
    }
  
    async getAll() {
      try {
        return await this.prisma.cities.findMany();
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while fetching all cities from the database"
        );
      }
    }
  
    async getById(id: number) {
      try {
        return await this.prisma.cities.findUnique({ where: { id } });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            `An error occurred while fetching city with the id: ${id}`
        );
      }
    }
  }
  