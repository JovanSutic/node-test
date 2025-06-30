import { PrismaService } from "../prisma/prisma.service";
import { DefValueDto, CreateDefValueDto } from "./def_value.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const checkForeignKeys = async (
  defValueDTO: DefValueDto,
  prisma: PrismaService
) => {
  const { definitionId, cityId, countryId } = defValueDTO;

  try {
    const [definition, city, country] = await Promise.all([
      prisma.definition.findUnique({ where: { id: definitionId } }),
      prisma.cities.findUnique({ where: { id: cityId || 0 } }),
      prisma.countries.findUnique({ where: { id: countryId || 0 } }),
    ]);

    if (!definition) {
      throw new BadRequestException(
        `Definition with ID ${definitionId} not found`
      );
    }

    if (!city && !country) {
      throw new BadRequestException(
        `Both city and country with provided ID ${definitionId} were not found`
      );
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

const validateDefValue = (defValue: CreateDefValueDto) => {
  if (
    !defValue.type ||
    typeof defValue.type !== "string" ||
    defValue.type.length < 3
  ) {
    throw new BadRequestException(
      "Type must be a string with at least 3 characters"
    );
  }

  if (!defValue.value) {
    if (!defValue.score || isNaN(Number(defValue.score))) {
      throw new BadRequestException(
        "Score must be defined when the value is empty"
      );
    }
  }

  if (!defValue.score) {
    if (
      !defValue.value ||
      typeof defValue.value !== "string" ||
      defValue.value.length < 3
    ) {
      throw new BadRequestException(
        "Value must be defined when the score is empty"
      );
    }
  }

  if (!defValue.definitionId || isNaN(Number(defValue.definitionId))) {
    throw new BadRequestException("DefinitionId must be a number");
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          validateDefValue(item);
        }
      } else {
        validateDefValue(value);
      }
    }

    return value;
  }
}

const checkDefValueExistence = async (
  defValue: DefValueDto | CreateDefValueDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in defValue) {
      item = await prisma.def_value.findUnique({
        where: { id: Number(defValue.id) },
      });
    } else {
      item = await prisma.def_value.findFirst({
        where: {
          cityId: defValue.cityId,
          countryId: defValue.countryId,
          value: defValue.value,
          score: defValue.score,
          definitionId: defValue.definitionId
        },
      });
    }

    if ("id" in defValue) {
      if (!item) {
        throw new NotFoundException(
          `Def value with ID ${defValue.id} not found`
        );
      }
    } else {
      if (item) {
        throw new ConflictException("Def value with this name already exists");
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
            await checkDefValueExistence(item, this.prisma);
          }
        } else {
          await checkDefValueExistence(value, this.prisma);
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
        const aspect = await this.prisma.def_value.findUnique({
          where: { id: Number(value) },
        });

        if (!aspect) {
          throw new NotFoundException(`Def value with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
