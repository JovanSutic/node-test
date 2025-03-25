import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CategoryDto, CreateCategoryDto } from "./categories.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(CreateCategoryDto: CreateCategoryDto) {
    const { name } = CreateCategoryDto;

    try {
      return await this.prisma.categories.create({
        data: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while creating the category in the database"
      );
    }
  }

  async getAll() {
    try {
      return await this.prisma.categories.findMany({ orderBy: [{ id: "asc" }] });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all categories from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.categories.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching category with the id: ${id}`
      );
    }
  }

  async getByEssentialData(name: string) {
    try {
      return await this.prisma.categories.findFirst({
        where: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching category by name: ${name}`
      );
    }
  }

  async updateMany(data: CategoryDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.categories.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple categories."
      );
    }
  }

  async updateSingle(id: number, data: CreateCategoryDto) {
    try {
      return await this.prisma.categories.update({
        where: {
          id,
        },
        data: {
          name: data.name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while updating category with the id: ${id}`
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.categories.delete({
        where: {
          id: id
        }
      })
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting category by id."
      );
    }
  }
}
