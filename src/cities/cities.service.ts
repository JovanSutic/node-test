import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto, CreateCityDto } from "./cities.dto";

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCityDto: CreateCityDto | CreateCityDto[]) {
    if (Array.isArray(createCityDto)) {
      try {
        return await this.prisma.cities.createMany({
          data: createCityDto.map((city) => ({
            name: city.name,
            country: city.country,
            search: city.search,
            lat: city.lat,
            lng: city.lng,
            seaside: city.seaside,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the cities in the database"
        );
      }
    } else {
      const { name, country, seaside, search, lat, lng } = createCityDto;

      try {
        return await this.prisma.cities.create({
          data: {
            name,
            country,
            seaside,
            search,
            lat,
            lng,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the city in the database"
        );
      }
    }
  }

  async getAll(take: number = 100) {
    try {
      const [data, total] = await Promise.all([
        this.prisma.cities.findMany({
          take,
          orderBy: [{ id: "asc" }],
        }),
        this.prisma.cities.count(),
      ]);
  
      return {
        data,
        total,
        limit: take,
      };
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
          `An error occurred while fetching city by essential data: ${name} and ${country}`
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
              search: item.search,
              lat: item.lat,
              lng: item.lng,
              seaside: item.seaside,
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
          search: data.search,
          lat: data.lat,
          lng: data.lng,
          seaside: data.seaside,
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
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting city by id."
      );
    }
  }

  async getCitiesInBounds(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
    take?: number;
  }) {
    const { north, south, east, west, take = 30 } = bounds;

    try {
      const where = {
        lat: {
          gte: south,
          lte: north,
        },
        lng: {
          gte: west,
          lte: east,
        },
      };

      const [data, total] = await Promise.all([
        this.prisma.cities.findMany({
          where,
          take,
        }),
        this.prisma.cities.count({ where }),
      ]);

      return {
        data,
        total,
        limit: take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while getting cities in bounds."
      );
    }
  }
}
