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
