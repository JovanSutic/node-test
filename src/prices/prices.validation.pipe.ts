import {
  type PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePriceDto, PriceType } from "./prices.dto";

@Injectable()
export class ForeignKeyValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    const { cityId, productId, yearId } = value;

    const [city, product, year] = await Promise.all([
      this.prisma.cities.findUnique({ where: { id: cityId } }),
      this.prisma.products.findUnique({ where: { id: productId } }),
      this.prisma.years.findUnique({ where: { id: yearId } }),
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

    return value;
  }
}

const checkPrice = (priceDto: CreatePriceDto) => {
  const { price, currency, priceType } = priceDto;
  console.log(priceDto);
  if (!Number.isInteger(price) || price <= 0) {
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
