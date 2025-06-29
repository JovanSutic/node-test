import { PrismaService } from "../prisma/prisma.service";
import { DefinitionDto, CreateDefinitionDto } from "./definition.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const checkForeignKeys = async (
  definitionDTO: DefinitionDto,
  prisma: PrismaService
) => {
  const { aspectId } = definitionDTO;

  try {
    const [aspect] = await Promise.all([
      prisma.aspect.findUnique({ where: { id: aspectId } }),
    ]);

    if (!aspect) {
      throw new BadRequestException(`Aspect with ID ${aspectId} not found`);
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

const validateDefinition = (definition: CreateDefinitionDto) => {
  if (
    !definition.label ||
    typeof definition.label !== "string" ||
    definition.label.length < 3
  ) {
    throw new BadRequestException(
      "Name must be a string with at least 3 characters"
    );
  }

  if (
    !definition.type ||
    typeof definition.type !== "string" ||
    definition.type.length < 3
  ) {
    throw new BadRequestException(
      "Type must be a string with at least 3 characters"
    );
  }

  if (!definition.aspectId || isNaN(Number(definition.aspectId))) {
    throw new BadRequestException("AspectId must be a number");
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          validateDefinition(item);
        }
      } else {
        validateDefinition(value);
      }
    }

    return value;
  }
}

const checkDefinitionExistence = async (
  definition: DefinitionDto | CreateDefinitionDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in definition) {
      item = await prisma.definition.findUnique({
        where: { id: Number(definition.id) },
      });
    } else {
      item = await prisma.definition.findFirst({
        where: {
          label: definition.label,
          aspectId: definition.aspectId,
        },
      });
    }

    if ("id" in definition) {
      if (!item) {
        throw new NotFoundException(
          `Definition with ID ${definition.id} not found`
        );
      }
    } else {
      if (item) {
        throw new ConflictException("Definition with this name already exists");
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
            await checkDefinitionExistence(item, this.prisma);
          }
        } else {
          await checkDefinitionExistence(value, this.prisma);
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
        const aspect = await this.prisma.definition.findUnique({
          where: { id: Number(value) },
        });

        if (!aspect) {
          throw new NotFoundException(`Definition with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
