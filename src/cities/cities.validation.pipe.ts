import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { isNumber } from "../utils/numbers";
import { PrismaService } from "../prisma/prisma.service";
import type { CityDto, CreateCityDto } from "./cities.dto";

const checkCityValues = (city: CreateCityDto) => {
  if (!city.name || typeof city.name !== "string" || city.name.length < 3) {
    throw new BadRequestException(
      "Name must be a string with at least 3 characters"
    );
  }

  if (
    !city.country ||
    typeof city.country !== "string" ||
    city.country.length < 3
  ) {
    throw new BadRequestException(
      "Country must be a string with at least 3 characters"
    );
  }

  if (!city.numbeo_id || !isNumber(city.numbeo_id)) {
    throw new BadRequestException(
      "Numbeo id must be a number with at least 3 length"
    );
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          checkCityValues(item);
        }
      } else {
        checkCityValues(value);
      }
    }

    return value;
  }
}
@Injectable()
export class ObjectTransformPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.id) {
            const idAsNumber = Number(item.id);
            if (isNaN(idAsNumber)) {
              throw new BadRequestException("Id must be a valid number");
            }
            value[index].id = idAsNumber;
          }
        });
      } else {
        if (value.id) {
          const idAsNumber = Number(value.id);
          if (isNaN(idAsNumber)) {
            throw new BadRequestException("Id must be a valid number");
          }
          value.id = idAsNumber;
        }
      }
    }
    return value;
  }
}

const checkCityExistence = async (
  city: CityDto | CreateCityDto,
  prisma: PrismaService
) => {
  let item = undefined;
  if ("id" in city) {
    item = await prisma.cities.findUnique({
      where: { id: Number(city.id) },
    });
  } else {
    item = await prisma.cities.findFirst({
      where: {
        name: city.name,
        country: city.country,
      },
    });
  }

  if ("id" in city) {
    if (!item) {
      throw new NotFoundException(`City with ID ${city.id} not found`);
    }
  } else {
    if (item) {
      throw new ConflictException(
        "City with this name and country already exists"
      );
    }
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
            await checkCityExistence(item, this.prisma);
          }
        } else {
          await checkCityExistence(value, this.prisma);
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
        const city = await this.prisma.cities.findUnique({
          where: { id: Number(value) },
        });

        if (!city) {
          throw new NotFoundException(`City with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
