import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto, CreateCityDto } from "./cities.dto";
import type { SocialType } from "../social_lifestyle/social_lifestyle.dto";
import type { PriceType } from "../prices/prices.dto";
import { CrimeRankDto } from "../crimes/crimes.dto";
import { getCrimeSummery } from "../utils/crimes";

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
            countriesId: city.countriesId,
            search: city.search,
            lat: city.lat,
            lng: city.lng,
            seaside: city.seaside,
            size: city.size || 100000,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the cities in the database"
        );
      }
    } else {
      const { name, country, seaside, search, lat, lng, size, countriesId } =
        createCityDto;

      try {
        return await this.prisma.cities.create({
          data: {
            name,
            country,
            countriesId: countriesId!,
            seaside,
            search,
            lat,
            lng,
            size: size || 100000,
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

  async getAll(
    take: number = 100,
    sortBy: string,
    order: "asc" | "desc",
    fromId?: number,
    country?: string
  ) {
    try {
      const where: any = {};

      if (fromId !== undefined) {
        where.id = { gte: fromId };
      }

      if (country) {
        where.country = country;
      }
      const [data, total] = await Promise.all([
        this.prisma.cities.findMany({
          where,
          take,
          orderBy: {
            [sortBy]: order,
          },
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
        error.message ||
          "An error occurred while fetching all cities from the database"
      );
    }
  }

  async getAllCards(
    take: number = 100,
    sortBy: string,
    order: "asc" | "desc",
    fromId?: number,
    country?: string
  ) {
    try {
      const where: any = {};

      if (fromId !== undefined) {
        where.id = { gte: fromId };
      }

      if (country) {
        where.country = country;
      }

      // 1. First database query: Get cities and their cost of living data
      const [citiesWithCost, total] = await Promise.all([
        this.prisma.cities.findMany({
          where,
          take,
          orderBy: {
            [sortBy]: order,
          },
          include: {
            layers: {
              where: { layerTypeId: 2 },
              select: { value: true },
            },
          },
        }),
        this.prisma.cities.count({ where }),
      ]);

      // Extract all city IDs from the first database call's results
      const cityIds = citiesWithCost.map((city) => city.id);

      // 2. Second database query: Get all crime ranks for all cities at once
      const crimeRanks = await this.prisma.crime_ranks.findMany({
        where: {
          cityId: { in: cityIds },
          crimeAspectId: { not: 13 },
        },
      });

      const groupedCrime: Record<string, CrimeRankDto[]> = {};

      cityIds.forEach((item) => {
        groupedCrime[item] = [];
      });

      crimeRanks.forEach((item) => {
        if (groupedCrime[item.cityId]) {
          groupedCrime[item.cityId].push(item as unknown as CrimeRankDto);
        }
      });

      const decoratedCities = citiesWithCost.map((city) => {
        const { layers, ...rest } = city;
        const crimeSummery = groupedCrime[city.id]
          ? getCrimeSummery(groupedCrime[city.id])
          : null;
        return {
          ...rest,
          costOfLiving: city.layers[0].value || null,
          safetyRating: crimeSummery,
        };
      });

      return {
        data: decoratedCities,
        total,
        limit: take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching cities from the database"
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
              countriesId: item.countriesId,
              search: item.search,
              lat: item.lat,
              lng: item.lng,
              seaside: item.seaside,
              size: item.size || 100000,
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
          countriesId: data.countriesId,
          search: data.search,
          lat: data.lat,
          lng: data.lng,
          seaside: data.seaside,
          size: data.size || 100000,
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

  async getCitiesInBounds({
    north,
    south,
    east,
    west,
    take,
    sortBy,
    order,
  }: {
    north: number;
    south: number;
    east: number;
    west: number;
    take: number;
    sortBy: string;
    order: "asc" | "desc";
  }) {
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
          orderBy: {
            [sortBy]: order,
          },
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

  async getCitiesWithoutSocialReportType(type: SocialType) {
    try {
      const citiesWithType =
        await this.prisma.city_social_lifestyle_report.findMany({
          where: {
            type,
          },
          select: {
            cityId: true,
          },
          distinct: ["cityId"],
        });

      const cityIdsWithType = citiesWithType.map((r) => r.cityId);

      return this.prisma.cities.findMany({
        where: {
          id: {
            notIn: cityIdsWithType,
          },
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error fetching cities without social report type"
      );
    }
  }

  async getCitiesWithMissingPrices(
    priceType: PriceType,
    yearId: number,
    lessThan = 55
  ) {
    try {
      const citiesWithEnoughPrices = await this.prisma.prices.groupBy({
        by: ["cityId"],
        where: {
          yearId,
          priceType,
        },
        _count: {
          id: true,
        },
        having: {
          id: {
            _count: {
              gte: lessThan,
            },
          },
        },
      });

      const cityIdsToExclude = citiesWithEnoughPrices.map(
        (entry) => entry.cityId
      );

      const cities = await this.prisma.cities.findMany({
        where: {
          id: {
            notIn: cityIdsToExclude,
          },
        },
      });

      return cities;
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error fetching cities with missing prices"
      );
    }
  }
}
