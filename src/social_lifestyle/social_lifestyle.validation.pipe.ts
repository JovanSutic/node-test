import {
  type PipeTransform,
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateSocialLifestyleDto,
  SocialLifestyleDto,
} from "./social_lifestyle.dto";

const checkForeignKeys = async (
  socialLifestyleDto: CreateSocialLifestyleDto,
  prisma: PrismaService
) => {
  const { cityId, yearId } = socialLifestyleDto;

  try {
    const [city, year] = await Promise.all([
      prisma.cities.findUnique({ where: { id: cityId } }),
      prisma.years.findUnique({ where: { id: yearId } }),
    ]);

    if (!city) {
      throw new BadRequestException(`City with ID ${cityId} not found`);
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
      await Promise.all(
        value.map((item) => checkForeignKeys(item, this.prisma))
      );
    } else {
      await checkForeignKeys(value, this.prisma);
    }

    return value;
  }
}

const checkPrice = (priceDto: CreateSocialLifestyleDto) => {
  const { avg_price, currency } = priceDto;
  if (typeof avg_price !== "number" || isNaN(avg_price) || avg_price < 0.01) {
    throw new BadRequestException("Price must be a positive integer");
  }

  if (typeof currency !== "string" || currency.trim() === "") {
    throw new BadRequestException("Currency must be a non-empty string");
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

const checkLifestyleExistence = async (
  price: SocialLifestyleDto | CreateSocialLifestyleDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in price) {
      item = await prisma.city_social_lifestyle_report.findUnique({
        where: { id: Number(price.id) },
      });
    } else {
      item = await prisma.city_social_lifestyle_report.findFirst({
        where: {
          yearId: price.yearId,
          cityId: price.cityId,
        },
      });
    }

    if ("id" in price) {
      if (!item) {
        throw new NotFoundException(`Social lifestyle with ID ${price.id} not found`);
      }
    } else {
      if (item) {
        throw new ConflictException("Social lifestyle with this name already exists");
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
            await checkLifestyleExistence(item, this.prisma);
          }
        } else {
          await checkLifestyleExistence(value, this.prisma);
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
        const price = await this.prisma.city_social_lifestyle_report.findUnique({
          where: { id: Number(value) },
        });

        if (!price) {
          throw new NotFoundException(`Social lifestyle with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
