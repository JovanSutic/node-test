import { PrismaService } from "../prisma/prisma.service";
import { AspectDto, CreateAspectDto } from "./aspect.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const validateAspect = (aspect: CreateAspectDto) => {
  if (
    !aspect.name ||
    typeof aspect.name !== "string" ||
    aspect.name.length < 3
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
          validateAspect(item);
        }
      } else {
        validateAspect(value);
      }
    }

    return value;
  }
}

const checkAspectExistence = async (
  aspect: AspectDto | CreateAspectDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in aspect) {
      item = await prisma.aspect.findUnique({
        where: { id: Number(aspect.id) },
      });
    } else {
      item = await prisma.aspect.findFirst({
        where: {
          name: aspect.name,
        },
      });
    }

    if ("id" in aspect) {
      if (!item) {
        throw new NotFoundException(
          `Aspect with ID ${aspect.id} not found`
        );
      }
    } else {
      if (item) {
        throw new ConflictException("Aspect with this name already exists");
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
            await checkAspectExistence(item, this.prisma);
          }
        } else {
          await checkAspectExistence(value, this.prisma);
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
        const aspect = await this.prisma.aspect.findUnique({
          where: { id: Number(value) },
        });

        if (!aspect) {
          throw new NotFoundException(`Aspect with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
