import { PrismaService } from "../prisma/prisma.service";
import { CountryDto, CreateCountryDto } from "./countries.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const validateCountry = (country: CreateCountryDto) => {
  if (
    !country.name ||
    typeof country.name !== "string" ||
    country.name.length < 3
  ) {
    throw new BadRequestException(
      "Name must be a string with at least 3 characters"
    );
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          validateCountry(item);
        }
      } else {
        validateCountry(value);
      }
    }

    return value;
  }
}

const checkCountryExistence = async (
  country: CountryDto | CreateCountryDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in country) {
      item = await prisma.countries.findUnique({
        where: { id: Number(country.id) },
      });
    } else {
      item = await prisma.countries.findFirst({
        where: {
          name: country.name,
        },
      });
    }

    if ("id" in country) {
      if (!item) {
        throw new NotFoundException(
          `Country with ID ${country.id} not found`
        );
      }
    } else {
      if (item) {
        throw new ConflictException("Country with this name already exists");
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
            await checkCountryExistence(item, this.prisma);
          }
        } else {
          await checkCountryExistence(value, this.prisma);
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
        const city = await this.prisma.countries.findUnique({
          where: { id: Number(value) },
        });

        if (!city) {
          throw new NotFoundException(`Country with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
