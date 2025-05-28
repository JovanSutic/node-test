import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCrimeAspectDto,
  CreateCrimeRankDto,
  CrimeRanksQueryDto,
} from "./crimes.dto";
import type { CityDto } from "../cities/cities.dto";

@Injectable()
export class CrimesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRanks(data: CreateCrimeRankDto | CreateCrimeRankDto[]) {
    const today = new Date();
    try {
      if (Array.isArray(data)) {
        return await this.prisma.crime_ranks.createMany({
          data: data.map((item) => ({
            cityId: item.cityId,
            yearId: item.yearId,
            crimeAspectId: item.crimeAspectId,
            rank: item.rank,
            created_at: today,
          })),
          skipDuplicates: true,
        });
      }

      return await this.prisma.crime_ranks.create({
        data: {
          ...data,
          created_at: today,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while creating crime ranks."
      );
    }
  }

  async updateRanks(data: CreateCrimeRankDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((rank) =>
          this.prisma.crime_ranks.updateMany({
            where: {
              cityId: rank.cityId,
              yearId: rank.yearId,
              crimeAspectId: rank.crimeAspectId,
            },
            data: {
              rank: rank.rank,
              yearId: rank.yearId,
              crimeAspectId: rank.crimeAspectId,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating crime ranks."
      );
    }
  }

  async getAllRanks(filters: CrimeRanksQueryDto = {}) {
    const { cityId, yearId, crimeAspectId, rankGte, rankLte } = filters;

    const where: any = {};

    if (cityId) where.cityId = parseInt(cityId, 10);
    if (yearId) where.yearId = parseInt(yearId, 10);
    if (crimeAspectId) where.crimeAspectId = parseInt(crimeAspectId, 10);
    if (rankGte || rankLte) {
      where.rank = {};
      if (rankGte) where.rank.gte = parseFloat(rankGte);
      if (rankLte) where.rank.lte = parseFloat(rankLte);
    }

    try {
      return await this.prisma.crime_ranks.findMany({
        where,
        include: {
          crime_aspect: true,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all crime ranks."
      );
    }
  }

  async getCitySafetySummary(cityId: number, yearId: number) {
    try {
      const crimeData = await this.prisma.crime_ranks.findMany({
        where: {
          cityId,
          yearId,
        },
      });

      if (!crimeData.length) {
        throw new NotFoundException(
          `No crime data found for cityId: ${cityId}, yearId: ${yearId}`
        );
      }

      const crimeConcernIds = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

      const concernRanks = crimeData
        .filter((entry) => crimeConcernIds.includes(entry.crimeAspectId))
        .map((entry) => entry.rank);

      const overallCrimeConcernIndex =
        concernRanks.reduce((sum, val) => sum + val, 0) / concernRanks.length;

      const daylight = crimeData.find((e) => e.crimeAspectId === 14)?.rank ?? 0;
      const night = crimeData.find((e) => e.crimeAspectId === 15)?.rank ?? 0;

      const personalSafetyScore = 0.3 * daylight + 0.7 * night;

      const crimeEscalationIndicator =
        crimeData.find((e) => e.crimeAspectId === 2)?.rank ?? 0;

      return {
        overallCrimeConcernIndex: parseFloat(
          overallCrimeConcernIndex.toFixed(2)
        ),
        personalSafetyScore: parseFloat(personalSafetyScore.toFixed(2)),
        crimeEscalationIndicator: parseFloat(
          crimeEscalationIndicator.toFixed(2)
        ),
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to compute city safety summary."
      );
    }
  }

  async getAverageCrimeRank({
    aspectId,
    yearId,
    country,
  }: {
    aspectId: number;
    yearId: number;
    country?: string;
  }) {
    let cityFilter: { id: number }[] = [];
  
    if (country) {
      try {
        const cities = await this.prisma.cities.findMany({
          where: {
            country: {
              equals: country,
              mode: "insensitive",
            },
          },
          select: { id: true },
        });
  
        if (!cities.length) {
          throw new NotFoundException(`No cities found for country: ${country}`);
        }
  
        cityFilter = cities;
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Failed to fetch cities for country"
        );
      }
    }
  
    let ranks;
    try {
      ranks = await this.prisma.crime_ranks.findMany({
        where: {
          crimeAspectId: aspectId,
          yearId,
          ...(country ? { cityId: { in: cityFilter.map((c) => c.id) } } : {}),
        },
      });
  
      if (!ranks.length) {
        throw new NotFoundException("No matching crime rank records found.");
      }
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to fetch crime rank records."
      );
    }
  
    const average =
      ranks.reduce((sum, item) => sum + item.rank, 0) / ranks.length;
  
    return {
      aspectId,
      yearId,
      country: country || null,
      count: ranks.length,
      average: parseFloat(average.toFixed(2)),
    };
  }

  async getCitiesMissingCrimeRanks(
    threshold: number,
    yearId: number
  ): Promise<{ totalCities: number; missingCities: CityDto[] }> {
    let totalCities = 0;
    let citiesAboveThreshold = [];
    let missingCities: CityDto[] = [];
    try {
      totalCities = await this.prisma.cities.count();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed fetch city count."
      );
    }

    try {
      citiesAboveThreshold = await this.prisma.crime_ranks.groupBy({
        by: ["cityId"],
        where: { yearId },
        _count: { cityId: true },
        having: {
          cityId: {
            _count: {
              gte: threshold,
            },
          },
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed fetch crime grouped by cityId."
      );
    }

    if (citiesAboveThreshold.length === totalCities) {
      return { totalCities, missingCities };
    }

    const cityIdsAboveThreshold = citiesAboveThreshold.map((c) => c.cityId);

    if (cityIdsAboveThreshold.length === totalCities) {
      return { totalCities, missingCities: [] };
    }

    try {
      missingCities = (await this.prisma.cities.findMany({
        where: {
          id: {
            notIn: cityIdsAboveThreshold.length ? cityIdsAboveThreshold : [0],
          },
        },
      })) as CityDto[];
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed fetch missing cities."
      );
    }

    return { totalCities, missingCities: missingCities };
  }

  async createAspect(data: CreateCrimeAspectDto) {
    const today = new Date();
    try {
      return await this.prisma.crime_aspects.create({
        data: {
          name: data.name,
          created_at: today,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while creating a crime aspect."
      );
    }
  }

  async getAllAspects() {
    try {
      return await this.prisma.crime_aspects.findMany();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching crime aspects"
      );
    }
  }

  async deleteAspect(id: string) {
    try {
      return await this.prisma.crime_aspects.delete({
        where: { id: Number(id) },
      });
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(
        error.message || "An error occurred while deleting the crime aspect."
      );
    }
  }
}
