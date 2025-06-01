import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  UseGuards,
  UsePipes,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { WeathersService } from "./weathers.service";
import { WeathersDto, CreateWeathersDto } from "./weathers.dto";
import { AuthGuard } from "../utils/auth.guard";
import {
  WeatherCityExistsPipe,
  WeatherExistencePipe,
  WeatherValidationPipe,
} from "./weathers.validation.pipe";

@ApiTags("weathers")
@Controller("weathers")
export class WeathersController {
  constructor(private readonly weathersService: WeathersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(WeatherValidationPipe, WeatherExistencePipe, WeatherCityExistsPipe)
  @ApiOperation({ summary: "Create a new weather record" })
  @ApiBody({
    type: CreateWeathersDto,
    examples: {
      "application/json": {
        summary: "Create weather data for a city",
        value: {
          cityId: 1,
          sunshine: 250,
          rain: 100,
          cold: 60,
          heat: 90,
          cold_extremes: 5,
          heat_extremes: 3,
          humidity: 75,
          severe: "Low risk of storms",
          lowest: -10,
          highest: 35,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Weather record created successfully",
    type: WeathersDto,
    examples: {
      "application/json": {
        summary: "Created weather record",
        value: {
          id: 1,
          cityId: 1,
          sunshine: 250,
          rain: 100,
          cold: 60,
          heat: 90,
          cold_extremes: 5,
          heat_extremes: 3,
          humidity: 75,
          severe: "Low risk of storms",
          lowest: -10,
          highest: 35,
          created_at: "2025-05-30T12:00:00.000Z",
        },
      },
    },
  })
  async create(
    @Body() data: CreateWeathersDto
  ): Promise<WeathersDto | { count: number }> {
    try {
      return await this.weathersService.create(data);
    } catch (error: any) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all weather records" })
  @ApiResponse({
    status: 200,
    description: "List of weather records",
    type: WeathersDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "List of WeathersDto",
        value: [
          {
            id: 1,
            cityId: 1,
            sunshine: 250,
            rain: 100,
            cold: 60,
            heat: 90,
            cold_extremes: 5,
            heat_extremes: 3,
            humidity: 75,
            severe: "Low risk of storms",
            lowest: -10,
            highest: 35,
            created_at: "2025-05-30T12:00:00.000Z",
          },
          {
            id: 1,
            cityId: 1,
            sunshine: 250,
            rain: 100,
            cold: 60,
            heat: 90,
            cold_extremes: 5,
            heat_extremes: 3,
            humidity: 75,
            severe: "Low risk of storms",
            lowest: -10,
            highest: 35,
            created_at: "2025-05-30T12:00:00.000Z",
          },
        ],
      },
    },
  })
  async getAll(@Query("country") country?: string): Promise<WeathersDto[]> {
    try {
      return await this.weathersService.getAll(country);
    } catch (error: any) {
      throw error;
    }
  }

  @Get("city/:cityId")
  @ApiOperation({ summary: "Get weather records by city ID" })
  @ApiResponse({
    status: 200,
    description: "Weather records for the specified city",
    type: WeathersDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "WeathersDto with query cityId",
        value: {
          id: 1,
          cityId: 1,
          sunshine: 250,
          rain: 100,
          cold: 60,
          heat: 90,
          cold_extremes: 5,
          heat_extremes: 3,
          humidity: 75,
          severe: "Low risk of storms",
          lowest: -10,
          highest: 35,
          created_at: "2025-05-30T12:00:00.000Z",
        },
      },
    },
  })
  async getByCity(
    @Param("cityId") cityId: string
  ): Promise<WeathersDto | null> {
    const cityIdNum = Number(cityId);
    if (isNaN(cityIdNum)) {
      throw new BadRequestException("cityId must be a valid number");
    }
    try {
      return await this.weathersService.getByCity(cityIdNum);
    } catch (error: any) {
      throw error;
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(WeatherValidationPipe, WeatherExistencePipe, WeatherCityExistsPipe)
  @ApiOperation({ summary: "Update existing weather records" })
  @ApiBody({
    description: "Array of weather records to update",
    type: CreateWeathersDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "Updated weather record",
        value: [
          {
            id: 1,
            cityId: 1,
            sunshine: 250,
            rain: 100,
            cold: 60,
            heat: 90,
            cold_extremes: 5,
            heat_extremes: 3,
            humidity: 75,
            severe: "Low risk of storms",
            lowest: -10,
            highest: 35,
            created_at: "2025-05-30T12:00:00.000Z",
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Successfully updated weather records",
    type: WeathersDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "Updated weather record",
        value: [
          {
            id: 1,
            cityId: 1,
            sunshine: 250,
            rain: 100,
            cold: 60,
            heat: 90,
            cold_extremes: 5,
            heat_extremes: 3,
            humidity: 75,
            severe: "Low risk of storms",
            lowest: -10,
            highest: 35,
            created_at: "2025-05-30T12:00:00.000Z",
          },
        ],
      },
    },
  })
  async updateWeathers(@Body() data: CreateWeathersDto[]) {
    try {
      return await this.weathersService.update(data);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to update weather records."
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a weather record by ID" })
  @ApiResponse({
    status: 200,
    description: "Deleted weather record",
    type: WeathersDto,
    examples: {
      "application/json": {
        summary: "Deleted weather record",
        value: {
          id: 1,
          cityId: 1,
          sunshine: 250,
          rain: 100,
          cold: 60,
          heat: 90,
          cold_extremes: 5,
          heat_extremes: 3,
          humidity: 75,
          severe: "Low risk of storms",
          lowest: -10,
          highest: 35,
          created_at: "2025-05-30T12:00:00.000Z",
        },
      },
    },
  })
  async delete(@Param("id") id: string): Promise<WeathersDto> {
    const idNum = Number(id);
    if (isNaN(idNum)) {
      throw new BadRequestException("id must be a valid number");
    }
    try {
      return await this.weathersService.delete(idNum);
    } catch (error: any) {
      throw error;
    }
  }
}
