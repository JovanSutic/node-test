import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Put,
  Delete,
  UseGuards,
  UnprocessableEntityException,
  UsePipes,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";
import { CityContextService } from "./city_context.service";
import {
  CreateCityContextDto,
  CityContextQueryDto,
  CityContextDto,
} from "./city_context.dto";
import {
  CityContextCityExistsPipe,
  CityContextExistencePipe,
  CityContextValidationPipe,
} from "./city_context.validation.pipe";

@Controller("city-context")
@ApiTags("city-context")
export class CityContextController {
  constructor(private readonly cityContextService: CityContextService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(
    CityContextValidationPipe,
    CityContextCityExistsPipe,
    CityContextExistencePipe
  )
  @ApiOperation({ summary: "Create one or many city context entries" })
  @ApiResponse({
    status: 201,
    description: "Successfully created a city context",
    type: CityContextDto,
    examples: {
      single: {
        summary: "CityContext DTO",
        value: {
          id: 1,
          cityId: 1,
          climate: "string",
          tourismLevel: "string",
          expatCommunity: "string",
          natureAccess: "string",
          localLifestyle: "string",
          seasonality: "string",
          cultureHighlights: "string",
          sportsAndActivities: "string",
          detailedStory: "string",
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 100 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new price",
    type: CityContextDto,
    examples: {
      single: {
        value: {
          cityId: 1,
          climate: "string",
          tourismLevel: "string",
          expatCommunity: "string",
          natureAccess: "string",
          localLifestyle: "string",
          seasonality: "string",
          cultureHighlights: "string",
          sportsAndActivities: "string",
          detailedStory: "string",
        },
      },
      multiple: {
        value: [
          {
            cityId: 1,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
          },
          {
            cityId: 1,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
          },
        ],
      },
    },
  })
  async create(@Body() dto: CreateCityContextDto | CreateCityContextDto[]) {
    try {
      return await this.cityContextService.create(dto);
    } catch (error: any) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: "Get all city context entries with optional filters",
  })
  @ApiResponse({
    status: 200,
    description: "List of CityContextDto",
    type: CityContextDto,
    examples: {
      multiple: {
        summary: "CityContextDto array",
        value: {
          data: [
            {
              id: 1,
              cityId: 1,
              climate: "string",
              tourismLevel: "string",
              expatCommunity: "string",
              natureAccess: "string",
              localLifestyle: "string",
              seasonality: "string",
              cultureHighlights: "string",
              sportsAndActivities: "string",
              detailedStory: "string",
              created_at: "2025-03-26T19:50:30.809Z",
              updated_at: "2025-03-26T19:50:30.809Z",
            },
            {
              id: 2,
              cityId: 2,
              climate: "string",
              tourismLevel: "string",
              expatCommunity: "string",
              natureAccess: "string",
              localLifestyle: "string",
              seasonality: "string",
              cultureHighlights: "string",
              sportsAndActivities: "string",
              detailedStory: "string",
              created_at: "2025-03-26T19:50:30.809Z",
              updated_at: "2025-03-26T19:50:30.809Z",
            },
          ],
          total: 0,
          limit: 10,
          offset: 0,
        },
      },
    },
  })
  async getAll(@Query() query: CityContextQueryDto) {
    try {
      return await this.cityContextService.getAll(query);
    } catch (error: any) {
      throw error;
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get city context by ID" })
  @ApiResponse({
    status: 200,
    description: "City context entry",
    type: CityContextDto,
    examples: {
      single: {
        summary: "CityContextDto object",
        value: {
          id: 1,
          cityId: 1,
          climate: "string",
          tourismLevel: "string",
          expatCommunity: "string",
          natureAccess: "string",
          localLifestyle: "string",
          seasonality: "string",
          cultureHighlights: "string",
          sportsAndActivities: "string",
          detailedStory: "string",
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.cityContextService.getById(Number(id));
    } catch (error: any) {
      throw error;
    }
  }

  @Get("city/:cityId")
  @ApiOperation({ summary: "Get city context by ID" })
  @ApiResponse({
    status: 200,
    description: "City context entry",
    type: CityContextDto,
    examples: {
      single: {
        summary: "CityContextDto object",
        value: {
          id: 1,
          cityId: 1,
          climate: "string",
          tourismLevel: "string",
          expatCommunity: "string",
          natureAccess: "string",
          localLifestyle: "string",
          seasonality: "string",
          cultureHighlights: "string",
          sportsAndActivities: "string",
          detailedStory: "string",
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getByCityId(@Param("cityId") cityId: string) {
    const cityIdNum = Number(cityId);
    if (isNaN(cityIdNum)) {
      throw new BadRequestException("cityId must be a valid number");
    }
    try {
      return await this.cityContextService.getByCityId(cityIdNum);
    } catch (error: any) {
      throw error;
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(
    CityContextValidationPipe,
    CityContextCityExistsPipe,
    CityContextExistencePipe
  )
  @ApiOperation({ summary: "Update one or many city context entries" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated a city context",
    type: CityContextDto,
    examples: {
      multiple: {
        summary: "Update CityContextDto",
        value: [
          {
            id: 1,
            cityId: 1,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            cityId: 2,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update new city context",
    type: CityContextDto,
    examples: {
      multiple: {
        value: [
          {
            id: 1,
            cityId: 1,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            cityId: 2,
            climate: "string",
            tourismLevel: "string",
            expatCommunity: "string",
            natureAccess: "string",
            localLifestyle: "string",
            seasonality: "string",
            cultureHighlights: "string",
            sportsAndActivities: "string",
            detailedStory: "string",
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async update(@Body() data: (CityContextDto & { id: number })[]) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new UnprocessableEntityException(
          "You must provide one or more entries to update."
        );
      }
      return await this.cityContextService.updateMany(data);
    } catch (error: any) {
      throw error;
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete city context by ID" })
  @ApiResponse({
    status: 200,
    description: "City context delete",
    type: CityContextDto,
    examples: {
      single: {
        summary: "CityContextDto object",
        value: {
          id: 1,
          cityId: 1,
          climate: "string",
          tourismLevel: "string",
          expatCommunity: "string",
          natureAccess: "string",
          localLifestyle: "string",
          seasonality: "string",
          cultureHighlights: "string",
          sportsAndActivities: "string",
          detailedStory: "string",
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.cityContextService.delete(Number(id));
    } catch (error: any) {
      throw error;
    }
  }
}
