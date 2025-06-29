import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DefinitionDto, CreateDefinitionDto } from "./definition.dto";

@Injectable()
export class DefinitionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDefinitionDto: CreateDefinitionDto | CreateDefinitionDto[]) {
    if (Array.isArray(createDefinitionDto)) {
      try {
        return await this.prisma.definition.createMany({
          data: createDefinitionDto.map((item) => ({
            label: item.label,
            type: item.type,
            aspectId: item.aspectId,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the definition in the database"
        );
      }
    } else {
      const { label, type, aspectId } = createDefinitionDto;

      try {
        return await this.prisma.definition.create({
          data: {
            label,
            type,
            aspectId,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the definition in the database"
        );
      }
    }
  }

  async getAll() {
    try {
      return await this.prisma.definition.findMany({
        orderBy: [{ id: "asc" }],
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all definition from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.definition.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching definition with the id: ${id}`
      );
    }
  }

  async getByEssentialData(label: string) {
    try {
      return await this.prisma.definition.findFirst({
        where: {
          label,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching definition by label: ${label}`
      );
    }
  }

  async updateMany(data: DefinitionDto[]) {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.definition.update({
            where: {
              id: item.id,
            },
            data: {
              label: item.label,
              type: item.type,
              aspectId: item.aspectId,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple definition."
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.definition.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting definition by id."
      );
    }
  }
}
