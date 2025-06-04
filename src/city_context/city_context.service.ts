import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCityContextDto, CityContextDto } from "./city_context.dto";

@Injectable()
export class CityContextService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCityContextDto | CreateCityContextDto[]) {
    const now = new Date();

    if (Array.isArray(dto)) {
      try {
        return await this.prisma.city_context.createMany({
          data: dto.map((item) => ({
            ...item,
            created_at: now,
            updated_at: now,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Failed to create city contexts."
        );
      }
    }

    try {
      return await this.prisma.city_context.create({
        data: {
          ...dto,
          created_at: now,
          updated_at: now,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to create city context."
      );
    }
  }

  async getAll(params: {
    cityId?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    order?: "asc" | "desc";
  }) {
    const {
      cityId,
      limit = 10,
      offset = 0,
      sortBy = "id",
      order = "desc",
    } = params;

    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.city_context.findMany({
          where: {
            ...(cityId && { cityId }),
          },
          skip: Number(offset),
          take: Number(limit),
          orderBy: {
            [sortBy]: order,
          },
        }),
        this.prisma.city_context.count({
          where: {
            ...(cityId && { cityId }),
          },
        }),
      ]);

      return {
        data,
        total,
        limit: Number(limit),
        offset,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to fetch city contexts."
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.city_context.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Failed to fetch city context with ID ${id}.`
      );
    }
  }

  async getByCityId(cityId: number) {
    try {
      return await this.prisma.city_context.findUnique({
        where: { cityId },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Failed to fetch city context with cityId ${cityId}.`
      );
    }
  }

  async updateMany(data: (CityContextDto & { id: number })[]) {
    const now = new Date();

    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.city_context.update({
            where: { id: item.id },
            data: {
              ...item,
              updated_at: now,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to update city contexts."
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.city_context.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Failed to delete city context with ID ${id}.`
      );
    }
  }
}
