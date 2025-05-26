import { BadRequestException, ConflictException, Injectable, NotFoundException, type PipeTransform } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CrimeRankValidationPipe implements PipeTransform {
  transform(value: any) {
    const validate = (item: any) => {
      if (
        typeof item.rank !== "number" ||
        item.rank < 0 ||
        item.rank > 100
      ) {
        throw new BadRequestException("Rank must be a number between 0 and 100.");
      }

      if (!item.cityId || isNaN(Number(item.cityId))) {
        throw new BadRequestException("cityId must be a valid number.");
      }

      if (!item.yearId || isNaN(Number(item.yearId))) {
        throw new BadRequestException("yearId must be a valid number.");
      }

      if (!item.crimeAspectId || isNaN(Number(item.crimeAspectId))) {
        throw new BadRequestException("crimeAspectId must be a valid number.");
      }
    };


    if (Array.isArray(value)) {
      value.forEach((item) => validate(item));
    } else {
      validate(value);
    }

    return value;
  }
}

@Injectable()
export class CrimeRankCreateExistencePipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    const checkExistence = async (item: any) => {
      const exists = await this.prisma.crime_ranks.findUnique({
        where: {
          cityId_yearId_crimeAspectId: {
            cityId: Number(item.cityId),
            yearId: Number(item.yearId),
            crimeAspectId: Number(item.crimeAspectId),
          },
        },
      });

      if (exists) {
        throw new ConflictException(
          `Crime rank already exists for cityId=${item.cityId}, yearId=${item.yearId}, crimeAspectId=${item.crimeAspectId}`
        );
      }
    };

    if (Array.isArray(value)) {
      for (const item of value) {
        await checkExistence(item);
      }
    } else {
      await checkExistence(value);
    }

    return value;
  }
}

@Injectable()
export class CrimeRankUpdateExistencePipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    const checkExistence = async (item: any) => {
      const exists = await this.prisma.crime_ranks.findUnique({
        where: {
          cityId_yearId_crimeAspectId: {
            cityId: Number(item.cityId),
            yearId: Number(item.yearId),
            crimeAspectId: Number(item.crimeAspectId),
          },
        },
      });

      if (!exists) {
        throw new NotFoundException(
          `No existing crime rank found for cityId=${item.cityId}, yearId=${item.yearId}, crimeAspectId=${item.crimeAspectId}`
        );
      }
    };

    if (Array.isArray(value)) {
      for (const item of value) {
        await checkExistence(item);
      }
    } else {
      await checkExistence(value);
    }

    return value;
  }
}

@Injectable()
export class CrimeRankForeignKeysPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    const validateForeignKeys = async (item: any) => {
      const [city, year, aspect] = await Promise.all([
        this.prisma.cities.findUnique({ where: { id: Number(item.cityId) } }),
        this.prisma.years.findUnique({ where: { id: Number(item.yearId) } }),
        this.prisma.crime_aspects.findUnique({ where: { id: Number(item.crimeAspectId) } }),
      ]);

      if (!city) throw new NotFoundException(`City with ID ${item.cityId} not found`);
      if (!year) throw new NotFoundException(`Year with ID ${item.yearId} not found`);
      if (!aspect) throw new NotFoundException(`Crime aspect with ID ${item.crimeAspectId} not found`);
    };

    if (Array.isArray(value)) {
      for (const item of value) {
        await validateForeignKeys(item);
      }
    } else {
      await validateForeignKeys(value);
    }

    return value;
  }
}
