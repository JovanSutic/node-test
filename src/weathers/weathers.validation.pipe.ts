import {
  Injectable,
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WeatherValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const requiredFields = [
      "cityId",
      "sunshine",
      "rain",
      "cold",
      "heat",
      "cold_extremes",
      "heat_extremes",
      "humidity",
      "severe",
      "lowest",
      "highest",
    ];

    const validate = (item: Record<string, any>) => {
      const missingFields = requiredFields.filter(
        (field) => item[field] === undefined
      );

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }
    };

    if (Array.isArray(value)) {
      for (const item of value) {
        validate(item);
      }
    } else {
      validate(value);
    }

    return value;
  }
}

@Injectable()
export class WeatherExistencePipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: any) {
    const validate = async (item: Record<string, any>) => {
      const { cityId, id } = item;

      let existing;
      try {
        existing = await this.prisma.weathers.findUnique({
          where: { cityId },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to query weather data for cityId ${cityId}.`
        );
      }

      if (!id && existing) {
        throw new BadRequestException(
          `Weather data for cityId ${cityId} already exists.`
        );
      }

      if (id && !existing) {
        throw new NotFoundException(
          `Weather data for cityId ${cityId} not found.`
        );
      }
    };

    try {
      if (Array.isArray(value)) {
        for (const item of value) {
          await validate(item);
        }
      } else {
        await validate(value);
      }
    } catch (error) {
      throw error;
    }

    return value;
  }
}

@Injectable()
export class WeatherCityExistsPipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: any) {
    const validateForeignKeys = async (item: any) => {
      const cityExists = await this.prisma.cities.findUnique({
        where: { id: item.cityId },
      });

      if (!cityExists) {
        throw new NotFoundException(
          `Referenced cityId ${item.cityId} does not exist.`
        );
      }
    };
    if (Array.isArray(value)) {
      for (const item of value) {
        try {
          await validateForeignKeys(item);
        } catch (error) {
          throw error;
        }
      }
    } else {
      try {
        await validateForeignKeys(value);
      } catch (error) {
        throw error;
      }
    }

    return value;
  }
}
