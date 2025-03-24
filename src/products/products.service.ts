import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProductDto, CreateProductDto } from "./products.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCityDto: CreateProductDto) {
    const { name, categoryId, unit, description } = createCityDto;

    try {
      return await this.prisma.products.create({
        data: {
          name,
          unit,
          categoryId,
          description: description || ""
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while creating the product in the database"
      );
    }
  }

  async getAll() {
    try {
      return await this.prisma.products.findMany({ orderBy: [{ id: "asc" }] });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all products from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.products.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching product with the id: ${id}`
      );
    }
  }

  async getByName(name: string) {
    try {
      return await this.prisma.products.findFirst({
        where: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching product by name: ${name}`
      );
    }
  }

  async updateMany(data: ProductDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.products.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
              unit: item.unit,
              categoryId: item.categoryId,
              description: item.description
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple cities."
      );
    }
  }

  async updateSingle(id: number, data: CreateProductDto) {
    try {
      return await this.prisma.products.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          unit: data.unit,
          categoryId: data.categoryId,
          description: data.description
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while updating product with the id: ${id}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.products.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting product by id."
      );
    }
  }
}
