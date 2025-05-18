import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  PriceDto,
  CreatePriceDto,
  PriceQueryDto,
  PriceType,
} from "./prices.dto";

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPriceDto: CreatePriceDto | CreatePriceDto[]) {
    const today = new Date();
    if (Array.isArray(createPriceDto)) {
      try {
        return await this.prisma.prices.createMany({
          data: createPriceDto.map((item) => ({
            price: item.price,
            top: item.top || undefined,
            bottom: item.bottom || undefined,
            currency: item.currency,
            cityId: item.cityId,
            productId: item.productId,
            yearId: item.yearId,
            priceType: item.priceType,
            createdAt: today,
            updatedAt: today,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the category in the database"
        );
      }
    } else {
      const {
        price,
        currency,
        cityId,
        productId,
        yearId,
        priceType,
        top,
        bottom,
      } = createPriceDto;

      try {
        return await this.prisma.prices.create({
          data: {
            price,
            top: top || undefined,
            bottom: bottom || undefined,
            currency,
            cityId,
            productId,
            yearId,
            priceType,
            createdAt: today,
            updatedAt: today,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the price in the database"
        );
      }
    }
  }

  async getAll(filters: PriceQueryDto) {
    const {
      currency,
      cityId,
      productId,
      yearId,
      priceType,
      limit = 10,
      offset = 0,
      sortBy = "createdAt",
      order = "desc",
    } = filters;
    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.prices.findMany({
          where: {
            ...(currency && { currency }),
            ...(cityId && { cityId: Number(cityId) }),
            ...(productId && { productId: Number(productId) }),
            ...(yearId && { yearId: Number(yearId) }),
            ...(priceType && { priceType }),
          },
          skip: Number(offset),
          take: Number(limit),
          orderBy: {
            [sortBy]: order,
          },
        }),
        this.prisma.prices.count({
          where: {
            ...(currency && { currency }),
            ...(cityId && { cityId: Number(cityId) }),
            ...(productId && { productId: Number(productId) }),
            ...(yearId && { yearId: Number(yearId) }),
            ...(priceType && { priceType }),
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
        error.message ||
          "An error occurred while fetching all prices from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.prices.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching price with the id: ${id}`
      );
    }
  }

  async updateMany(data: PriceDto[]) {
    const today = new Date();
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.prices.update({
            where: {
              id: item.id,
            },
            data: {
              price: item.price,
              top: item.top,
              bottom: item.bottom,
              currency: item.currency,
              cityId: item.cityId,
              productId: item.productId,
              yearId: item.yearId,
              priceType: item.priceType,
              updatedAt: today,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple prices."
      );
    }
  }

  async updateSingle(id: number, data: CreatePriceDto) {
    const today = new Date();
    try {
      return await this.prisma.prices.update({
        where: {
          id,
        },
        data: {
          price: data.price,
          top: data.top,
          bottom: data.bottom,
          currency: data.currency,
          cityId: data.cityId,
          productId: data.productId,
          yearId: data.yearId,
          priceType: data.priceType,
          updatedAt: today,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while updating price with the id: ${id}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.prices.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting price by id."
      );
    }
  }

  async getUniqueCityIds(priceType?: PriceType): Promise<number[]> {
    const cityIds = await this.prisma.prices.findMany({
      where: {
        ...(priceType && { priceType }),
      },
      distinct: ["cityId"],
      select: {
        cityId: true,
      },
    });

    return cityIds.map((entry) => entry.cityId);
  }

  async getAverageCountryPrices(
    country: string,
    yearId: number,
    priceType: PriceType = PriceType.CURRENT
  ) {
    const result = await this.prisma.prices.groupBy({
      by: ['productId'],
      where: {
        price: {
          gt: 0.01,
        },
        priceType,
        yearId,
        city: {
          country,
        },
      },
      _avg: {
        price: true,
      },
    });
  
    return result.map((item) => ({
      country,
      productId: item.productId,
      average_price: item._avg.price ?? 0,
      yearId,
    }));
  }

  async getUnmarkedPrices(
    country: string,
    yearId: number,
    priceType: PriceType
  ) {
    return this.prisma.prices.findMany({
      where: {
        price: 0.01,
        priceType,
        yearId,
        city: {
          country,
        },
      },
    });
  }
  
  
}
