import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateYearDto } from "./years.dto";

@Injectable()
export class YearsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createYearDto: CreateYearDto) {
    const { year } = createYearDto;
    try {
      return await this.prisma.years.create({
        data: {
          year,
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
      return await this.prisma.years.findMany({ orderBy: [{ id: "asc" }] });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all cities from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.years.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching city with the id: ${id}`
      );
    }
  }

  async getByYear(year: number) {
    try {
      return await this.prisma.years.findUnique({ where: { year } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching city with the id: ${year}`
      );
    }
  }
}
