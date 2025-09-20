import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto, CreateCityDto } from "./cities.dto";
import type { SocialType } from "../social_lifestyle/social_lifestyle.dto";
import type { PriceType } from "../prices/prices.dto";
import { CrimeRankDto } from "../crimes/crimes.dto";
import { getCrimeSummery } from "../utils/crimes";
import type { LayerDto } from "../layers/layers.dto";

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

  async getAllCards({
    north,
    south,
    east,
    west,
    take,
    sortBy,
    order,
    country,
    seaside,
    size,
    offset = 0,
  }: {
    north: number;
    south: number;
    east: number;
    west: number;
    take: number;
    sortBy: string;
    order: "asc" | "desc";
    country?: string;
    seaside?: boolean;
    size?: number;
    offset?: number;
  }) {
    try {
      const cityWhere: any = {};

      if (country) {
        cityWhere.country = country;
      }

      if (
        north !== undefined &&
        south !== undefined &&
        east !== undefined &&
        west !== undefined
      ) {
        cityWhere.lat = { gte: south, lte: north };
        cityWhere.lng = { gte: west, lte: east };
      }

      if (seaside !== undefined) {
        cityWhere.seaside = seaside;
      }

      if (size !== undefined) {
        cityWhere.size = { lte: size };
      }

      const eligibleCountries = await this.prisma.def_value.findMany({
        where: {
          definitionId: 33,
          countryId: { not: null },
        },
        select: {
          countryId: true,
        },
        distinct: ["countryId"],
      });

      const eligibleCountryIds = eligibleCountries.map(
        (item) => item.countryId
      );

      cityWhere.countriesId = {
        in: eligibleCountryIds,
      };

      const [citiesWithCost, total] = await Promise.all([
        this.prisma.cities.findMany({
          where: cityWhere,
          skip: offset,
          take,
          orderBy: [
            { [sortBy]: order },
            { id: order },
          ],
          include: {
            layers: {
              where: { layerTypeId: 2 },
              select: { value: true },
            },
          },
        }),
        this.prisma.cities.count({
          where: cityWhere,
        }),
      ]);

      const cityIds = citiesWithCost.map((city) => city.id);

      const crimeRanks = await this.prisma.crime_ranks.findMany({
        where: {
          cityId: { in: cityIds },
          crimeAspectId: { not: 13 },
        },
      });

      const groupedCrime: Record<string, CrimeRankDto[]> = {};
      cityIds.forEach((id) => (groupedCrime[id] = []));
      crimeRanks.forEach((rank) => {
        if (groupedCrime[rank.cityId]) {
          groupedCrime[rank.cityId].push(rank as unknown as CrimeRankDto);
        }
      });

      const decoratedCities = citiesWithCost.map((city) => {
        const { layers, ...rest } = city;
        const crimeSummary = groupedCrime[city.id]
          ? getCrimeSummery(groupedCrime[city.id])
          : null;

        return {
          ...rest,
          costOfLiving: (layers as unknown as LayerDto[])[0]?.value || null,
          safetyRating: crimeSummary,
        };
      });

      return {
        data: decoratedCities,
        total,
        limit: take,
        offset,
        hasMore: offset + take < total,
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
