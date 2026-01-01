import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CountryDto, CreateCountryDto } from "./countries.dto";

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    const { name } = createCountryDto;

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

  async getAll(params?: {
    definitionId?: number;
    orderBy?: "id" | "name";
    order?: "asc" | "desc";
  }) {
    try {
      const { definitionId, orderBy = "id", order = "asc" } = params || {};

      return await this.prisma.countries.findMany({
        where: definitionId
          ? {
              defValue: {
                some: {
                  definitionId,
                },
              },
            }
          : undefined,

        orderBy: {
          [orderBy]: order,
        },
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
