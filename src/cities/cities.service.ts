import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto, CreateCityDto } from "./cities.dto";

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto) {
    const { name, country, numbeo_id } = createCityDto;

    try {
      return await this.prisma.cities.create({
        data: {
          name,
          country,
          numbeo_id
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
      return await this.prisma.cities.findMany({ orderBy: [{ id: "asc" }] });
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

  async getByEssentialData(name: string, country: string) {
    try {
      return await this.prisma.cities.findFirst({
        where: {
          name,
          country,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching city with by essential data: ${name} and ${country}`
      );
    }
  }

  async updateMany(data: CityDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.cities.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
              country: item.country,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple cities."
      );
    }
  }

  async updateSingle(id: number, data: CreateCityDto) {
    try {
      return await this.prisma.cities.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          country: data.country,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while updating city with the id: ${id}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.cities.delete({
        where: {
          id: id
        }
      })
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting city by id."
      );
    }
  }
}
