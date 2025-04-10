import {
  type PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePriceDto, PriceType } from "./prices.dto";

const checkForeignKeys = async (
  priceDto: CreatePriceDto,
  prisma: PrismaService
) => {
  const { cityId, productId, yearId } = priceDto;

  try {
    const [city, product, year] = await Promise.all([
      prisma.cities.findUnique({ where: { id: cityId } }),
      prisma.products.findUnique({ where: { id: productId } }),
      prisma.years.findUnique({ where: { id: yearId } }),
    ]);
  
    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found`);
    }
    if (!product) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }
    if (!year) {
      throw new BadRequestException(`Year with ID ${yearId} not found`);
    }
  } catch (error) {
    throw error;
  }
};

@Injectable()
export class ForeignKeyValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    if (Array.isArray(value)) {
      value.forEach((item) => checkForeignKeys(item, this.prisma));
    } else {
      checkForeignKeys(value, this.prisma);
    }

    return value;
  }
}

const checkPrice = (priceDto: CreatePriceDto) => {
  const { price, currency, priceType } = priceDto;
  if (!Number.isInteger(price) || price < 0.01) {
    throw new BadRequestException("Price must be a positive integer");
  }

  if (typeof currency !== "string" || currency.trim() === "") {
    throw new BadRequestException("Currency must be a non-empty string");
  }

  if (!Object.values(PriceType).includes(priceType)) {
    throw new BadRequestException(
      `PriceType must be one of the following: ${Object.values(PriceType).join(
        ", "
      )}`
    );
  }
};

@Injectable()
export class StaticFieldValidationPipe implements PipeTransform {
  transform(value: any) {
    if (Array.isArray(value)) {
      value.forEach((item) => checkPrice(item));
    } else {
      checkPrice(value);
    }

    return value;
  }
}
