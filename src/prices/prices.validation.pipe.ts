import {
  type PipeTransform,
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePriceDto, PriceDto, PriceType } from "./prices.dto";

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
  if (typeof price !== "number" || isNaN(price) || price < 0.01) {
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

const checkPriceExistence = async (
  price: PriceDto | CreatePriceDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in price) {
      item = await prisma.prices.findUnique({
        where: { id: Number(price.id) },
      });
    } else {
      item = await prisma.prices.findFirst({
        where: {
          yearId: price.yearId,
          cityId: price.cityId,
          productId: price.productId,
          priceType: price.priceType,
        },
      });
    }

    if ("id" in price) {
      if (!item) {
        throw new NotFoundException(`Price with ID ${price.id} not found`);
      }
    } else {
      if (item) {
        throw new ConflictException("Price with this name already exists");
      }
    }
  } catch (error) {
    throw error;
  }
};

@Injectable()
export class ExistenceValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    if (value && typeof value === "object") {
      try {
        if (Array.isArray(value)) {
          for (const item of value) {
            await checkPriceExistence(item, this.prisma);
          }
        } else {
          await checkPriceExistence(value, this.prisma);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}

@Injectable()
export class UniqueExistenceValidation implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}
  async transform(value: any) {
    if (value && typeof value !== "object") {
      try {
        const price = await this.prisma.prices.findUnique({
          where: { id: Number(value) },
        });

        if (!price) {
          throw new NotFoundException(`Price with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
