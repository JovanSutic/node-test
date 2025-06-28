import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CountryDto, CreateCountryDto } from "./countries.dto";

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto | CreateCountryDto[]) {
    if (Array.isArray(createCountryDto)) {
      try {
        return await this.prisma.countries.createMany({
          data: createCountryDto.map((item) => ({
            name: item.name,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the country in the database"
        );
      }
    } else {
      const { name } = CreateCountryDto;

      try {
        return await this.prisma.countries.create({
          data: {
            name,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the country in the database"
        );
      }
    }
  }

  async getAll() {
    try {
      return await this.prisma.countries.findMany({
        orderBy: [{ id: "asc" }],
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all countries from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.countries.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching country with the id: ${id}`
      );
    }
  }

  async getByEssentialData(name: string) {
    try {
      return await this.prisma.countries.findFirst({
        where: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching country by name: ${name}`
      );
    }
  }

  async updateMany(data: CountryDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.countries.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple countries."
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.countries.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting country by id."
      );
    }
  }
}
