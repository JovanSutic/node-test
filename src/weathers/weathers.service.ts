import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WeathersDto, CreateWeathersDto } from "./weathers.dto";

@Injectable()
export class WeathersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWeathersDto | CreateWeathersDto[]) {
    const today = new Date();

    try {
      if (Array.isArray(data)) {
        const dataWithCreated = data.map((item) => ({
          ...item,
          created_at: today,
        }));

        return await this.prisma.weathers.createMany({
          data: dataWithCreated,
          skipDuplicates: true,
        });
      }

      return await this.prisma.weathers.create({
        data: {
          ...data,
          created_at: today,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while creating weather data."
      );
    }
  }

  async getAll(country?: string): Promise<WeathersDto[]> {
    try {
      if (country) {
        return await this.prisma.weathers.findMany({
          where: {
            city: {
              country: {
                equals: country,
                mode: "insensitive",
              },
            },
          },
          include: {
            city: true,
          },
        });
      }

      return await this.prisma.weathers.findMany();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to fetch weather records."
      );
    }
  }

  async getByCity(cityId: number): Promise<WeathersDto | null> {
    try {
      const weather = await this.prisma.weathers.findUnique({
        where: { cityId },
      });

      if (!weather) {
       null
      }

      return weather;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(
        error.message || "An error occurred while fetching weather data."
      );
    }
  }

  async update(data: CreateWeathersDto[]) {
    return await this.prisma.$transaction(
      data.map((weather) =>
        this.prisma.weathers.updateMany({
          where: { cityId: weather.cityId },
          data: {
            ...weather,
          },
        })
      )
    );
  }

  async delete(cityId: number): Promise<WeathersDto> {
    try {
      await this.getByCity(cityId);

      return await this.prisma.weathers.delete({
        where: { cityId },
      });
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException(
        error.message || "An error occurred while deleting weather data."
      );
    }
  }
}
