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
export class CityContextValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const requiredFields = [
      "cityId",
      "climate",
      "tourismLevel",
      "expatCommunity",
      "natureAccess",
      "localLifestyle",
      "seasonality",
      "cultureHighlights",
      "sportsAndActivities",
      "detailedStory",
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
export class CityContextExistencePipe implements PipeTransform {
  constructor(private prisma: PrismaService) {}

  async transform(value: any) {
    const validate = async (item: Record<string, any>) => {
      const { cityId, id } = item;

      let existing;
      try {
        existing = await this.prisma.city_context.findUnique({
          where: { cityId },
        });
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to query city context data for cityId ${cityId}.`
        );
      }

      if (!id && existing) {
        throw new BadRequestException(
          `City context for cityId ${cityId} already exists.`
        );
      }

      if (id && !existing) {
        throw new NotFoundException(
          `City context for cityId ${cityId} not found.`
        );
      }

      if (id && existing && id !== existing.id) {
        throw new NotFoundException(
          `City context for cityId ${cityId} has different id than provided.`
        );
      }
    };

    if (Array.isArray(value)) {
      for (const item of value) {
        await validate(item);
      }
    } else {
      await validate(value);
    }

    return value;
  }
}

@Injectable()
export class CityContextCityExistsPipe implements PipeTransform {
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
        await validateForeignKeys(item);
      }
    } else {
      await validateForeignKeys(value);
    }

    return value;
  }
}
