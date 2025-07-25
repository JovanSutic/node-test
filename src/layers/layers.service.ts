import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLayerDto, CreateLayerTypeDto, LayerDto } from "./layers.dto";

@Injectable()
export class LayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateLayerDto | CreateLayerDto[]) {
    if (Array.isArray(createDto)) {
      try {
        return await this.prisma.layer.createMany({
          data: createDto.map((item) => ({
            cityId: item.cityId,
            layerTypeId: item.layerTypeId,
            value: item.value,
            value_string: item.value_string,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Error while creating layers"
        );
      }
    } else {
      const { cityId, layerTypeId, value, value_string } = createDto;
      try {
        return await this.prisma.layer.create({
          data: {
            cityId,
            layerTypeId,
            value,
            value_string,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Error while creating the layer"
        );
      }
    }
  }

  async getAll(
    take = 100,
    sortBy: string = "id",
    order: "asc" | "desc" = "asc",
    fromId?: number,
    country?: string,
    budget?: number,
    rank?: number,
    north?: number,
    south?: number,
    east?: number,
    west?: number,
    seaside?: boolean,
    size?: number,
    layerTypeId?: number
  ) {
    try {
      const where: any = {};

      if (fromId !== undefined) {
        where.id = { gte: fromId };
      }

      // Layer type filter
      if (layerTypeId !== undefined) {
        where.layerTypeId = Array.isArray(layerTypeId)
          ? { in: layerTypeId }
          : layerTypeId;
      }

      where.city_feel = {};

      if (budget !== undefined) {
        where.city_feel.budget = { lte: budget };
      }

      if (rank !== undefined) {
        where.city_feel.rank = { gte: rank };
      }

      where.city = {};

      if (country) {
        where.city.country = country;
      }

      if (
        north !== undefined &&
        south !== undefined &&
        east !== undefined &&
        west !== undefined
      ) {
        where.city.lat = { gte: south, lte: north };
        where.city.lng = { gte: west, lte: east };
      }

      if (seaside !== undefined) {
        where.city.seaside = seaside;
      }

      if (size !== undefined) {
        where.city.size = { lte: size };
      }

      if (Object.keys(where.city).length === 0) {
        delete where.city;
      }

      const [data, total] = await Promise.all([
        this.prisma.layer.findMany({
          where,
          take,
          orderBy: {
            [sortBy]: order,
          },
          include: {
            city: true,
            layer_type: true,
            city_feel: true,
          },
        }),
        this.prisma.layer.count({ where }),
      ]);

      return {
        data,
        total,
        limit: take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching layers"
      );
    }
  }

  async getByCityId(cityId: number) {
    try {
      const layers = await this.prisma.layer.findMany({
        where: { cityId },
        include: {
          city: true,
          layer_type: true,
        },
      });

      return layers;
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching layers for city ID ${cityId}`
      );
    }
  }

  async getById(id: number) {
    try {
      return await this.prisma.layer.findUnique({
        where: { id },
        include: {
          layer_type: true,
          city: true,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while fetching layer with id: ${id}`
      );
    }
  }

  async update(data: LayerDto[]): Promise<any[]> {
    try {
      return await this.prisma.$transaction(
        data.map((item) =>
          this.prisma.layer.update({
            where: { id: item.id },
            data: {
              cityId: item.cityId,
              layerTypeId: item.layerTypeId,
              value: item.value,
              value_string: item.value_string,
            },
          })
        )
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while updating layers"
      );
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.layer.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while deleting the layer"
      );
    }
  }

  async deleteByCityIdAndType(cityId: number, layerTypeId: number) {
    try {
      // Fetch layers matching cityId and layerTypeId to return after deletion
      const layersToDelete = await this.prisma.layer.findMany({
        where: {
          cityId,
          layerTypeId,
        },
        include: {
          city: true,
          layer_type: true,
        },
      });

      if (layersToDelete.length === 0) {
        throw new BadRequestException(
          `No layers found for cityId: ${cityId} and layerTypeId: ${layerTypeId}`
        );
      }

      // Delete all matching layers
      await this.prisma.layer.deleteMany({
        where: {
          cityId,
          layerTypeId,
        },
      });

      return layersToDelete;
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting layers for cityId: ${cityId} and layerTypeId: ${layerTypeId}`
      );
    }
  }

  async createType(createDto: CreateLayerTypeDto | CreateLayerTypeDto[]) {
    if (Array.isArray(createDto)) {
      try {
        return await this.prisma.layer_type.createMany({
          data: createDto.map((item) => ({
            name: item.name,
            type: item.type,
          })),
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Error while creating layer types"
        );
      }
    } else {
      const { name } = createDto;
      try {
        return await this.prisma.layer_type.create({
          data: {
            name,
          },
        });
      } catch (error: any) {
        throw new BadRequestException(
          error.message || "Error while creating layer type"
        );
      }
    }
  }

  async getAllTypes() {
    try {
      return await this.prisma.layer_type.findMany({
        orderBy: [{ id: "asc" }],
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error while fetching layer types"
      );
    }
  }

  async deleteType(id: number) {
    try {
      return await this.prisma.layer_type.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error while deleting layer type"
      );
    }
  }
}
