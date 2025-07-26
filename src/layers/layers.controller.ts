import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  Put,
  UseGuards,
  UnprocessableEntityException,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { LayersService } from "./layers.service";
import {
  CreateLayerDto,
  CreateLayerTypeDto,
  DeleteLayerQueryDto,
  LayerDto,
  LayerTypeDto,
} from "./layers.dto";
import type { LayersQueryDto } from "../city_feel/city_feel.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";
import {
  LayerDeleteValidationPipe,
  LayerIdValidationPipe,
  LayerValidationPipe,
} from "./layers.validation.pipe";

@Controller("layers")
@ApiTags("layers")
export class LayersController {
  constructor(private readonly layersService: LayersService) {}

  // ──────── CREATE ────────

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(LayerValidationPipe)
  @ApiOperation({ summary: "Create one or many layer entries" })
  @ApiResponse({
    status: 201,
    description: "Successfully created layer(s)",
    type: LayerDto,
    examples: {
      single: {
        summary: "Single Layer Response",
        value: {
          id: 1,
          cityId: 2,
          layerTypeId: 1,
          value: 10.5,
          value_string: null,
          created_at: "2025-07-25T12:34:56.000Z",
        },
      },
      multiple: {
        summary: "Create Many Response",
        value: { count: 2 },
      },
    },
  })
  @ApiBody({
    description: "Layer creation payload",
    type: CreateLayerDto,
    isArray: true,
    examples: {
      single: {
        value: {
          cityId: 2,
          layerTypeId: 1,
          value: 10.5,
          value_string: "Optional string",
        },
      },
      multiple: {
        value: [
          {
            cityId: 2,
            layerTypeId: 1,
            value: 10.5,
            value_string: "Optional string",
          },
          {
            cityId: 3,
            layerTypeId: 2,
            value: 7.2,
            value_string: null,
          },
        ],
      },
    },
  })
  async createLayer(@Body() body: CreateLayerDto | CreateLayerDto[]) {
    return await this.layersService.create(body);
  }

  @Post("types")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create one or many layer types" })
  @ApiResponse({
    status: 201,
    description: "Successfully created layer type(s)",
    type: LayerTypeDto,
    examples: {
      single: {
        summary: "Single Layer Response",
        value: {
          id: 1,
          name: "Population Density",
        },
      },
      multiple: {
        summary: "Single Layer Response",
        value: { count: 2 },
      },
    },
  })
  @ApiBody({
    description: "Layer type creation payload",
    type: CreateLayerTypeDto,
    isArray: true,
    examples: {
      single: {
        value: {
          name: "Walkability",
        },
      },
      multiple: {
        value: [{ name: "Walkability" }, { name: "Green Space" }],
      },
    },
  })
  async createLayerType(
    @Body() body: CreateLayerTypeDto | CreateLayerTypeDto[]
  ) {
    return await this.layersService.createType(body);
  }

  // ──────── READ ────────

  @Get()
  @ApiOperation({ summary: "Get all layers with optional filters" })
  @ApiResponse({
    status: 200,
    description: "List of layers with optional filters",
    type: [LayerDto],
  })
  async getAllLayers(@Query() filters: LayersQueryDto) {
    const {
      take,
      sortBy,
      order,
      fromId,
      country,
      budget,
      rank,
      north,
      south,
      east,
      west,
      seaside,
      size,
      layerTypeId,
    } = filters;

    const parseIfDefined = (value: any, name: string): number | undefined => {
      if (value === undefined || value === null) return undefined;
      const parsed = Number(value);
      if (isNaN(parsed)) {
        throw new BadRequestException(`${name} must be a valid number.`);
      }
      return parsed;
    };

    return this.layersService.getAll(
      parseIfDefined(take, "take"),
      sortBy,
      order,
      parseIfDefined(fromId, "fromId"),
      country,
      parseIfDefined(budget, "budget"),
      parseIfDefined(rank, "rank"),
      parseIfDefined(north, "north"),
      parseIfDefined(south, "south"),
      parseIfDefined(east, "east"),
      parseIfDefined(west, "west"),
      seaside === "true" ? true : undefined,
      parseIfDefined(size, "size"),
      parseIfDefined(layerTypeId, "layerTypeId")
    );
  }

  @Get("city/:cityId")
  @ApiOperation({ summary: "Get all layers for a specific city" })
  @ApiResponse({
    status: 200,
    description: "Layer object",
    type: LayerDto,
    examples: {
      single: {
        summary: "Layer DTO",
        value: {
          id: 1,
          cityId: 1,
          layerTypeId: 2,
          value: 123.45,
          value_string: "Example string",
          created_at: "2025-07-25T15:30:00.000Z",
          city: {
            id: 1,
            name: "Sample City",
            country: "Sample Country",
            lat: 12.34,
            lng: 56.78,
            seaside: true,
            size: 100000,
          },
          layer_type: {
            id: 2,
            name: "Sample Layer Type",
          },
        },
      },
    },
  })
  async getByCityId(@Param("cityId", ParseIntPipe) cityId: number) {
    return this.layersService.getByCityId(cityId);
  }

  @Get(":id")
  @UsePipes(LayerIdValidationPipe)
  @ApiOperation({ summary: "Get all layers for a specific city" })
  @ApiResponse({
    status: 200,
    description: "Layer object",
    type: LayerDto,
    examples: {
      single: {
        summary: "Layer DTO",
        value: {
          id: 1,
          cityId: 1,
          layerTypeId: 2,
          value: 123.45,
          value_string: "Example string",
          created_at: "2025-07-25T15:30:00.000Z",
          city: {
            id: 1,
            name: "Sample City",
            country: "Sample Country",
            lat: 12.34,
            lng: 56.78,
            seaside: true,
            size: 100000,
          },
          layer_type: {
            id: 2,
            name: "Sample Layer Type",
          },
        },
      },
    },
  })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return this.layersService.getById(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(LayerValidationPipe)
  @ApiOperation({ summary: "Update one or many layer entries" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated layer(s)",
    type: LayerDto,
    isArray: true,
    examples: {
      multiple: {
        summary: "Layer DTO",
        value: [
          {
            id: 1,
            cityId: 1,
            layerTypeId: 2,
            value: 123.45,
            value_string: "Example string",
            created_at: "2025-07-25T15:30:00.000Z",
            city: {
              id: 1,
              name: "Sample City",
              country: "Sample Country",
              lat: 12.34,
              lng: 56.78,
              seaside: true,
              size: 100000,
            },
            layer_type: {
              id: 2,
              name: "Sample Layer Type",
            },
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "Layer update payload",
    type: LayerDto,
    isArray: true,
    examples: {
      multiple: {
        value: [
          {
            id: 1,
            cityId: 1,
            layerTypeId: 2,
            value: 123.45,
            value_string: "Example string",
            created_at: "2025-07-25T15:30:00.000Z",
          },
          {
            id: 2,
            cityId: 2,
            layerTypeId: 3,
            value: 678.9,
            value_string: "Another example",
            created_at: "2025-07-25T15:30:00.000Z",
          },
        ],
      },
    },
  })
  async update(@Body() data: LayerDto[]) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new UnprocessableEntityException(
          "You must provide one or more entries to update."
        );
      }
      return await this.layersService.update(data);
    } catch (error: any) {
      throw error;
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }), LayerDeleteValidationPipe)
  @ApiOperation({
    summary: "Delete layer(s) by id or by cityId and layerTypeId",
  })
  @ApiResponse({
    status: 200,
    description: "Deleted layer entry or entries",
    type: LayerDto,
    isArray: true, // true if deleting by cityId+type returns multiple
    examples: {
      single: {
        summary: "Deleted layer by id",
        value: {
          id: 1,
          cityId: 1,
          layerTypeId: 2,
          value: 123.45,
          value_string: "Example string",
          created_at: "2025-07-25T15:30:00.000Z",
          city: {
            id: 1,
            name: "Sample City",
            country: "Sample Country",
            lat: 12.34,
            lng: 56.78,
            seaside: true,
            size: 100000,
          },
          layer_type: {
            id: 2,
            name: "Sample Layer Type",
          },
        },
      },
      multiple: {
        summary: "Deleted layers by cityId and layerTypeId",
        value: [
          {
            id: 1,
            cityId: 1,
            layerTypeId: 2,
            value: 123,
            value_string: "example",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async delete(@Query() query: DeleteLayerQueryDto) {
    const { id, cityId, layerTypeId } = query;

    if (id !== undefined && !Number.isNaN(Number(id))) {
      return await this.layersService.delete(Number(id));
    }

    if (
      cityId !== undefined &&
      !Number.isNaN(Number(cityId)) &&
      layerTypeId !== undefined &&
      !Number.isNaN(Number(layerTypeId))
    ) {
      return await this.layersService.deleteByCityIdAndType(
        Number(cityId),
        Number(layerTypeId)
      );
    }

    throw new BadRequestException(
      "You must provide either an id or both cityId and layerTypeId query parameters."
    );
  }

  // ──────── LAYER TYPES ────────

  @Get("types/all")
  @ApiOperation({ summary: "Get all layer types" })
  @ApiResponse({
    status: 200,
    description: "List of all layer types",
    type: LayerTypeDto,
    isArray: true,
    examples: {
      multiple: {
        summary: "Layer types array",
        value: [
          { id: 1, name: "Type A" },
          { id: 2, name: "Type B" },
        ],
      },
    },
  })
  async getAllTypes() {
    return this.layersService.getAllTypes();
  }

  @Delete("types/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a layer type by ID" })
  @ApiResponse({
    status: 200,
    description: "Deleted layer type entry",
    type: LayerTypeDto,
    examples: {
      single: {
        summary: "Deleted layer type",
        value: { id: 1, name: "Type A" },
      },
    },
  })
  async deleteType(@Param("id", ParseIntPipe) id: number) {
    try {
      return await this.layersService.deleteType(id);
    } catch (error: any) {
      throw error;
    }
  }
}
