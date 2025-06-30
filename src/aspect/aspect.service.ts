import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AspectDto, CreateAspectDto } from "./aspect.dto";

@Injectable()
export class AspectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateAspectDto | CreateAspectDto[]) {
    if (Array.isArray(createCategoryDto)) {
      try {
        return await this.prisma.aspect.createMany({
          data: createCategoryDto.map((item) => ({
            name: item.name,
            field: item.field,
            scope: item.scope,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the aspect in the database"
        );
      }
    } else {
      const { name, field, scope } = createCategoryDto;

      try {
        return await this.prisma.aspect.create({
          data: {
            name,
            field,
            scope,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the aspect in the database"
        );
      }
    }
  }

  async getAll() {
    try {
      return await this.prisma.aspect.findMany({
        orderBy: [{ id: "asc" }],
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all aspect from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.aspect.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching aspect with the id: ${id}`
      );
    }
  }

  async getByEssentialData(name: string) {
    try {
      return await this.prisma.aspect.findFirst({
        where: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching aspect by name: ${name}`
      );
    }
  }

  async updateMany(data: AspectDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.aspect.update({
            where: {
              id: item.id,
            },
            data: {
              name: item.name,
              field: item.field,
              scope: item.scope,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple aspect."
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.aspect.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting aspect by id."
      );
    }
  }
}
