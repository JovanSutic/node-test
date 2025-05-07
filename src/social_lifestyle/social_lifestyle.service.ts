import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  SocialLifestyleDto,
  CreateSocialLifestyleDto,
  SocialLifestyleQueryDto,
} from "./social_lifestyle.dto";

@Injectable()
export class SocialLifestyleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createSocialLifestyleDto:
      | CreateSocialLifestyleDto
      | CreateSocialLifestyleDto[]
  ) {
    const today = new Date();
    if (Array.isArray(createSocialLifestyleDto)) {
      try {
        return await this.prisma.city_social_lifestyle_report.createMany({
          data: createSocialLifestyleDto.map((item) => ({
            cityId: item.cityId,
            yearId: item.yearId,
            avg_price: item.avg_price,
            currency: "EUR",
            created_at: today,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the social lifestyle in the database"
        );
      }
    } else {
      const { cityId, yearId, avg_price } = createSocialLifestyleDto;

      try {
        return await this.prisma.city_social_lifestyle_report.create({
          data: {
            cityId,
            yearId,
            avg_price,
            currency: "EUR",
            created_at: today,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the social lifestyle in the database"
        );
      }
    }
  }

  async getAll(query: SocialLifestyleQueryDto) {
    try {
      const {
        cityId,
        yearId,
        limit = 10,
        offset = 0,
        sortBy = "created_at",
        order = "desc",
      } = query;

      const where: any = {};
      if (cityId) where.cityId = Number(cityId);
      if (yearId) where.yearId = Number(yearId);

      const [data, total] = await Promise.all([
        this.prisma.city_social_lifestyle_report.findMany({
          where,
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            [sortBy]: order,
          },
        }),
        this.prisma.city_social_lifestyle_report.count({ where }),
      ]);

      return {
        data,
        total,
        limit,
        offset,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all social lifestyle from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.city_social_lifestyle_report.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching social lifestyle with the id: ${id}`
      );
    }
  }

  async updateMany(data: SocialLifestyleDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.city_social_lifestyle_report.update({
            where: {
              id: item.id,
            },
            data: {
              cityId: item.cityId,
              yearId: item.yearId,
              avg_price: item.avg_price,
              currency: "EUR",
              created_at: item.created_at,
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

  async delete(id: number) {
    try {
      return await this.prisma.city_social_lifestyle_report.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while deleting social lifestyle by id."
      );
    }
  }
}
