import { PrismaService } from "../prisma/prisma.service";
import { CategoryDto, CreateCategoryDto } from "./categories.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const validateCategory = (category: CreateCategoryDto) => {
  if (
    !category.name ||
    typeof category.name !== "string" ||
    category.name.length < 3
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
          validateCategory(item);
        }
      } else {
        validateCategory(value);
      }
    }

    return value;
  }
}

const checkCategoryExistence = async (
  category: CategoryDto | CreateCategoryDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in category) {
      item = await prisma.categories.findUnique({
        where: { id: Number(category.id) },
      });
    } else {
      item = await prisma.categories.findFirst({
        where: {
          name: category.name,
        },
      });
    }

    if ("id" in category) {
      if (!item) {
        throw new NotFoundException(
          `Category with ID ${category.id} not found`
        );
      }
    } else {
      if (item) {
        throw new ConflictException("Category with this name already exists");
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
            await checkCategoryExistence(item, this.prisma);
          }
        } else {
          await checkCategoryExistence(value, this.prisma);
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
        const city = await this.prisma.categories.findUnique({
          where: { id: Number(value) },
        });

        if (!city) {
          throw new NotFoundException(`Category with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
