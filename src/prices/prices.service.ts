import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PriceDto, CreatePriceDto } from "./prices.dto";

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreatePriceDto: CreatePriceDto) {
    const today = new Date();
    const { price, currency, cityId, productId, yearId, priceType } =
      CreatePriceDto;

    try {
      return await this.prisma.prices.create({
        data: {
          price,
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

  async getAll() {
    try {
      return await this.prisma.prices.findMany({ orderBy: [{ id: "asc" }] });
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
}
