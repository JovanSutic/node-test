import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCityFeelDto, CityFeelDto } from "./city_feel.dto";

@Injectable()
export class CityFeelService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateCityFeelDto | CreateCityFeelDto[]
  ): Promise<CityFeelDto | CityFeelDto[]> {
    const today = new Date();
    if (Array.isArray(data)) {
      try {
        return await this.prisma.city_feel.createMany({
          data: data.map((item) => ({
            cityId: item.cityId,
            budget: item.budget || 0,
            rank: item.rank,
            tags: item.tags || "",
            created_at: today,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the city feel in the database"
        );
      }
    } else {
      const { cityId, budget, rank, tags } = data;

      try {
        return await this.prisma.city_feel.create({
          data: {
            cityId,
            budget,
            rank,
            tags,
            created_at: today,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the city feel in the database"
        );
      }
    }
  }

  async getAll(
    take = 100,
    sortBy: string,
    order: "asc" | "desc",
    fromId?: number,
    country?: string,
    budget?: number,
    rank?: number,
    north?: number,
    south?: number,
    east?: number,
    west?: number
  ) {
    try {
      const where: any = {};

      if (fromId !== undefined) {
        where.id = { gte: fromId };
      }

      if (budget !== undefined) {
        where.budget = { lte: budget };
      }

      if (rank !== undefined) {
        where.rank = { gte: rank };
      }

      where.city = {};

      if (country) {
        where.city.country = country;
      }

      if (
        north !== undefined &&
        south !== undefined &&
        east !== undefined &&
        west !== undefined
      ) {
        where.city.lat = { gte: south, lte: north };
        where.city.lng = { gte: west, lte: east };
      }

      if (Object.keys(where.city).length === 0) {
        delete where.city;
      }

      const [data, total] = await Promise.all([
        this.prisma.city_feel.findMany({
          where,
          take,
          orderBy: {
            [sortBy]: order,
          },
          include: {
            city: true,
          },
        }),
        this.prisma.city_feel.count({ where }),
      ]);

      return {
        data,
        total,
        limit: take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching city feels"
      );
    }
  }

  async getByCityId(cityId: number): Promise<CityFeelDto> {
    try {
      const cityFeel = await this.prisma.city_feel.findUnique({
        where: { cityId },
        include: {
          city: true,
        },
      });
      if (!cityFeel) {
        null;
      }
      return cityFeel;
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching city feels by city id"
      );
    }
  }

  async update(data: CityFeelDto[]): Promise<CityFeelDto[]> {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.city_feel.update({
            where: { id: item.id },
            data: {
              ...item,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating city_feel entries."
      );
    }
  }

  async delete(cityId: number): Promise<CityFeelDto> {
    try {
      const deleted = await this.prisma.city_feel.delete({ where: { cityId } });
      return deleted;
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting city_feel record."
      );
    }
  }
}
