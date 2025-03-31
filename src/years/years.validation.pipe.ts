import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  type PipeTransform,
} from "@nestjs/common";
import type { CreateYearDto, YearDto } from "./years.dto";
import { PrismaService } from "../prisma/prisma.service";

const validateYear = (year: CreateYearDto, currentYear: number) => {
  if (
    !year.year ||
    Number(year.year) > currentYear ||
    Number(year.year) < 2010
  ) {
    throw new BadRequestException(
      `Year must be higher than 2010 and lower or equal ${currentYear}`
    );
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      const currentYear = new Date().getFullYear();
      if (Array.isArray(value)) {
        for (const item of value) {
          validateYear(item, currentYear);
        }
      } else {
        validateYear(value, currentYear);
      }
    }

    return value;
  }
}

const checkYearExistence = async (
  year: YearDto | CreateYearDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in year) {
      item = await prisma.years.findUnique({
        where: { id: Number(year.id) },
      });
    } else {
      item = await prisma.years.findFirst({
        where: {
          year: year.year,
        },
      });
    }

    if ("id" in year) {
      if (!item) {
        throw new NotFoundException(`Year with ID ${year.id} not found`);
      }
    } else {
      if (item) {
        throw new ConflictException("This year already exists");
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
            await checkYearExistence(item, this.prisma);
          }
        } else {
          await checkYearExistence(value, this.prisma);
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
        const year = await this.prisma.years.findUnique({
          where: { id: Number(value) },
        });

        if (!year) {
          throw new NotFoundException(`Year with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}