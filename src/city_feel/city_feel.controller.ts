import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  UnprocessableEntityException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";
import { CityFeelService } from "./city_feel.service";
import {
  CreateCityFeelDto,
  CityFeelDto,
  CityFeelQueryDto,
} from "./city_feel.dto";
import {
  CityFeelValidationPipe,
  CityFeelExistencePipe,
  CityFeelCityExistsPipe,
} from "./city_feel.validation.pipe";

@Controller("city-feel")
@ApiTags("city-feel")
export class CityFeelController {
  constructor(private readonly cityFeelService: CityFeelService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(
    CityFeelValidationPipe,
    CityFeelCityExistsPipe,
    CityFeelExistencePipe
  )
  @ApiOperation({ summary: "Create one or many city feel entries" })
  @ApiResponse({
    status: 201,
    description: "Successfully created city feel(s)",
    type: CityFeelDto,
    examples: {
      single: {
        summary: "CityContext DTO",
        value: {
          id: 1,
          cityId: 1,
          budget: 1880.8,
          rank: 1,
          tags: "tag",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 100 },
      },
    },
  })
  @ApiBody({
    description: "City feel creation payload",
    type: CityFeelDto,
    isArray: true,
    examples: {
      single: {
        value: {
          cityId: 1,
          budget: 1880.8,
          rank: 1,
          tags: "tag",
        },
      },
      multiple: {
        value: [
          {
            cityId: 1,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
          },
          {
            cityId: 2,
            budget: 2880.8,
            rank: 1,
            tags: "tag",
          },
        ],
      },
    },
  })
  async create(@Body() dto: CreateCityFeelDto | CreateCityFeelDto[]) {
    try {
      return await this.cityFeelService.create(dto);
    } catch (error: any) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all city feel entries with optional filters" })
  @ApiResponse({
    status: 200,
    description: "List of CityFeelDto with pagination",
    type: CityFeelDto,
    isArray: true,
    examples: {
      multiple: {
        summary: "Count",
        value: [
          {
            id: 1,
            cityId: 1,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
            created_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 1,
            cityId: 1,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async getAll(@Query() filters: CityFeelQueryDto) {
    try {
      const {
        take = 100,
        sortBy = "rank",
        order = "asc",
        fromId,
        country,
        budget,
        rank,
        north,
        south,
        east,
        west,
        size,
        seaside,
      } = filters;

      const parseIfDefined = (value: any, name: string): number | undefined => {
        if (value === undefined || value === null) return undefined;
        const parsed = Number(value);
        if (isNaN(parsed)) {
          throw new BadRequestException(`${name} must be a valid number.`);
        }
        return parsed;
      };

      return await this.cityFeelService.getAll(
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
        seaside === "true" ? true : false,
        parseIfDefined(size, "size")
      );
    } catch (error: any) {
      throw error;
    }
  }

  @Get(":cityId")
  @ApiOperation({ summary: "Get city feel by cityId" })
  @ApiResponse({
    status: 200,
    description: "CityFeelDto object",
    type: CityFeelDto,
    examples: {
      single: {
        summary: "CityContext DTO",
        value: {
          id: 1,
          cityId: 1,
          budget: 1880.8,
          rank: 1,
          tags: "tag",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getByCityId(@Param("cityId") cityId: string) {
    try {
      return await this.cityFeelService.getByCityId(Number(cityId));
    } catch (error: any) {
      throw error;
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(
    CityFeelValidationPipe,
    CityFeelCityExistsPipe,
    CityFeelExistencePipe
  )
  @ApiOperation({ summary: "Update one or many city feel entries" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated city feel(s)",
    type: CityFeelDto,
    isArray: true,
    examples: {
      multiple: {
        summary: "CityContext DTO",
        value: [
          {
            id: 1,
            cityId: 1,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "City feel update payload",
    type: CityFeelDto,
    isArray: true,
    examples: {
      multiple: {
        value: [
          {
            id: 1,
            cityId: 1,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
            created_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            cityId: 2,
            budget: 1880.8,
            rank: 1,
            tags: "tag",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async update(@Body() data: CityFeelDto[]) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new UnprocessableEntityException(
          "You must provide one or more entries to update."
        );
      }
      return await this.cityFeelService.update(data);
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(":cityId")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete city feel by cityId" })
  @ApiResponse({
    status: 200,
    description: "Deleted city feel entry",
    type: CityFeelDto,
    examples: {
      single: {
        summary: "CityContext DTO",
        value: {
          id: 1,
          cityId: 1,
          budget: 1880.8,
          rank: 1,
          tags: "tag",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async delete(@Param("cityId") cityId: string) {
    try {
      return await this.cityFeelService.delete(Number(cityId));
    } catch (error: any) {
      throw error;
    }
  }
}
