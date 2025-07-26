import {
  type PipeTransform,
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLayerDto, LayerDto } from "./layers.dto"; // adjust paths

@Injectable()
export class LayerValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(
    value: CreateLayerDto | LayerDto | Array<CreateLayerDto | LayerDto>
  ) {
    const layers = Array.isArray(value) ? value : [value];

    for (const layer of layers) {
      // Check required fields for create/update
      this.validateRequiredFields(layer);

      // Check foreign keys exist
      await this.checkForeignKeys(layer);

      if ("id" in layer && layer.id !== undefined) {
        // Update scenario - id must exist
        const exists = await this.prisma.layer.findUnique({
          where: { id: layer.id },
        });
        if (!exists) {
          throw new NotFoundException(
            `Layer with id ${layer.id} does not exist.`
          );
        }
      } else {
        // Create scenario - check unique cityId + layerTypeId
        const duplicate = await this.prisma.layer.findFirst({
          where: { cityId: layer.cityId, layerTypeId: layer.layerTypeId },
        });
        if (duplicate) {
          throw new UnprocessableEntityException(
            `Layer with cityId ${layer.cityId} and layerTypeId ${layer.layerTypeId} already exists.`
          );
        }
      }
    }

    return value;
  }

  private validateRequiredFields(layer: any) {
    const requiredFields = ["cityId", "layerTypeId"];
    for (const field of requiredFields) {
      if (layer[field] === undefined || layer[field] === null) {
        throw new BadRequestException(`Field '${field}' is required.`);
      }
    }
  }

  private async checkForeignKeys(layer: any) {
    // Check city exists
    const cityExists = await this.prisma.cities.findUnique({
      where: { id: layer.cityId },
    });
    if (!cityExists) {
      throw new UnprocessableEntityException(
        `City with id ${layer.cityId} does not exist.`
      );
    }

    // Check layer_type exists
    const layerTypeExists = await this.prisma.layer_type.findUnique({
      where: { id: layer.layerTypeId },
    });
    if (!layerTypeExists) {
      throw new UnprocessableEntityException(
        `Layer type with id ${layer.layerTypeId} does not exist.`
      );
    }

    // Check city_feel exists (optional?)
    const cityFeelExists = await this.prisma.city_feel.findUnique({
      where: { cityId: layer.cityId },
    });
    if (!cityFeelExists) {
      throw new UnprocessableEntityException(
        `City feel for cityId ${layer.cityId} does not exist.`
      );
    }
  }
}

@Injectable()
export class LayerIdValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(id: string) {
    const exists = await this.prisma.layer.findUnique({
      where: { id: Number(id) },
    });
    if (!exists) {
      throw new NotFoundException(`Layer with id ${id} not found.`);
    }
    return id;
  }
}

interface DeleteLayerQuery {
  id?: string;
  cityId?: string;
  layerTypeId?: string;
}

@Injectable()
export class LayerDeleteValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    const { id, cityId, layerTypeId } = value;

    if (id !== undefined) {
      const exists = await this.prisma.layer.findUnique({
        where: { id },
      });
      if (!exists) {
        throw new NotFoundException(`Layer with id ${id} not found.`);
      }
    } else if (cityId !== undefined && layerTypeId !== undefined) {
      const exists = await this.prisma.layer.findFirst({
        where: {
          cityId: Number(cityId),
          layerTypeId: Number(layerTypeId),
        },
      });

      if (!exists) {
        throw new NotFoundException(
          `Layer with cityId ${cityId} and layerTypeId ${layerTypeId} not found.`
        );
      }
    } else {
      throw new BadRequestException(
        "You must provide either an id or both cityId and layerTypeId."
      );
    }

    return value;
  }
}
