import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import type { CreateProductDto, ProductDto } from "./products.dto";
import { PrismaService } from "../prisma/prisma.service";

const validateProduct = (product: CreateProductDto) => {
  if (
    !product.name ||
    typeof product.name !== "string" ||
    product.name.length < 3
  ) {
    throw new BadRequestException(
      "Name must be a string with at least 3 characters"
    );
  }

  if (!product.categoryId || typeof product.categoryId !== "number") {
    throw new BadRequestException("categoryId must be a number");
  }

  if (
    !product.unit ||
    typeof product.unit !== "string" ||
    product.unit.length < 3
  ) {
    throw new BadRequestException(
      "Unit must be a string with at least 3 characters"
    );
  }
};
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          validateProduct(item);
        }
      } else {
        validateProduct(value);
      }
    }

    return value;
  }
}

const checkProductExistence = async (
  product: ProductDto | CreateProductDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in product) {
      item = await prisma.products.findUnique({
        where: { id: Number(product.id) },
      });
    } else {
      item = await prisma.products.findFirst({
        where: {
          name: product.name,
        },
      });
    }

    if ("id" in product) {
      if (!item) {
        throw new NotFoundException(`Product with ID ${product.id} not found`);
      }
    } else {
      if (item) {
        throw new ConflictException("Product with this name already exists");
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
            await checkProductExistence(item, this.prisma);
          }
        } else {
          await checkProductExistence(value, this.prisma);
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
        const city = await this.prisma.products.findUnique({
          where: { id: Number(value) },
        });

        if (!city) {
          throw new NotFoundException(`Product with ID ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
