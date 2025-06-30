import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DefValueDto, CreateDefValueDto } from "./def_value.dto";

@Injectable()
export class DefValueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDefValueDto: CreateDefValueDto | CreateDefValueDto[]) {
    const today = new Date();
    if (Array.isArray(createDefValueDto)) {
      try {
        return await this.prisma.def_value.createMany({
          data: createDefValueDto.map((item) => ({
            definitionId: item.definitionId,
            cityId: item.cityId,
            countryId: item.countryId,
            value: item.value,
            score: item.score,
            comment: item.comment,
            note: item.note,
            type: item.type,
            visible: true,
            created_at: today,
            updated_at: today,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the def_value in the database"
        );
      }
    } else {
      const {
        definitionId,
        cityId,
        countryId,
        value,
        score,
        comment,
        note,
        type,
      } = createDefValueDto;

      try {
        return await this.prisma.def_value.create({
          data: {
            definitionId,
            cityId,
            countryId,
            value,
            score,
            comment,
            note,
            type,
            visible: true,
            created_at: today,
            updated_at: today,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message ||
            "An error occurred while creating the def_value in the database"
        );
      }
    }
  }

  async getAll() {
    try {
      return await this.prisma.def_value.findMany({
        orderBy: [{ id: "asc" }],
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all def_value from the database"
      );
    }
  }

  async getByAspectFieldAndLocation(
    field: string,
    cityId?: number,
    countryId?: number
  ) {
    try {
      const defValues = await this.prisma.def_value.findMany({
        where: {
          AND: [
            {
              definition: {
                aspect: {
                  field: field,
                },
              },
            },
            cityId ? { cityId } : {},
            countryId ? { countryId } : {},
            { visible: true },
          ],
        },
        include: {
          definition: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      // Group by definition
      const groupedByDefinition = defValues.reduce((acc, val) => {
        const defId = val.definition.id;
        if (!acc[defId]) {
          acc[defId] = {
            definition: val.definition,
            values: [],
          };
        }
        acc[defId].values.push(val);
        return acc;
      }, {} as Record<number, { definition: any; values: any[] }>);

      return Object.values(groupedByDefinition);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching filtered def_values"
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.def_value.findUnique({ where: { id } });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching def_value with the id: ${id}`
      );
    }
  }

  async updateMany(data: DefValueDto[]) {
    try {
      const today = new Date();
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.def_value.update({
            where: {
              id: item.id,
            },
            data: {
              definitionId: item.definitionId,
              cityId: item.cityId,
              countryId: item.countryId,
              value: item.value,
              score: item.score,
              comment: item.comment,
              note: item.note,
              type: item.type,
              visible: item.visible,
              created_at: item.created_at,
              updated_at: today,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating multiple def_value."
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.def_value.delete({
        where: {
          id: id,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting def_value by id."
      );
    }
  }
}
