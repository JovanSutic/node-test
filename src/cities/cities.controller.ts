import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CreateCityDto, CityDto } from "./cities.dto";
import { CitiesService } from "./cities.service";
import {
  ExistenceValidationPipe,
  ObjectTransformPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./cities.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("cities")
@ApiTags("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Create the new city." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a city",
    type: CityDto,
    examples: {
      single: {
        summary: "Single created city",
        value: {
          id: 1,
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new city",
    type: CreateCityDto,
    examples: {
      single: {
        value: {
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "Amsterdam",
            country: "Netherlands",
            search: "Amsterdam",
            lat: 52.1234,
            lng: 12.1234,
            seaside: true,
          },
          {
            id: 2,
            name: "Belgrade",
            country: "Serbia",
            search: "Belgrade",
            lat: 52.1234,
            lng: 12.1234,
            seaside: true,
          },
        ],
      },
    },
  })
  async create(@Body() createCityDto: CreateCityDto | CreateCityDto[]) {
    try {
      return await this.citiesService.create(createCityDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the city"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all cities." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved cities.",
    isArray: true,
    type: CityDto,
    examples: {
      "application/json": {
        summary: "City DTO array",
        value: [
          {
            id: 1,
            name: "Amsterdam",
            country: "Netherlands",
            search: "Amsterdam",
            lat: 52.1234,
            lng: 12.1234,
            seaside: true,
          },
          {
            id: 2,
            name: "Belgrade",
            country: "Serbia",
            search: "Belgrade",
            lat: 52.1234,
            lng: 12.1234,
            seaside: false,
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.citiesService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the cities"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return city by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved city by id.",
    type: CityDto,
    examples: {
      "application/json": {
        summary: "City DTO",
        value: {
          id: 1,
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.citiesService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the city with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ObjectTransformPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Update cities" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated cities.",
    isArray: true,
    type: CityDto,
    examples: {
      single: {
        summary: "Single updated city",
        value: {
          id: 1,
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
      multiple: {
        summary: "Multiple updated cities",
        value: [
          {
            id: 1,
            name: "Amsterdam",
            country: "Netherlands",
            search: "Amsterdam",
            lat: 52.1234,
            lng: 12.1234,
            seaside: true,
          },
          {
            id: 2,
            name: "Belgrade",
            country: "Serbia",
            search: "Belgrade",
            lat: 52.1234,
            lng: 12.1234,
            seaside: false,
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update city",
    type: CreateCityDto,
    examples: {
      single: {
        value: {
          id: 1,
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "Amsterdam",
            country: "Netherlands",
            search: "Amsterdam",
            lat: 52.1234,
            lng: 12.1234,
            seaside: true,
          },
          {
            id: 2,
            name: "Belgrade",
            country: "Serbia",
            search: "Belgrade",
            lat: 52.1234,
            lng: 12.1234,
            seaside: false,
          },
        ],
      },
    },
  })
  async update(@Body() data: CityDto[]) {
    try {
      if (data.length === 1) {
        const [city] = data;
        return await this.citiesService.updateSingle(Number(city.id), city);
      } else if (data.length > 1) {
        return await this.citiesService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple cities you need to provide array of CityDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the cities"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete city by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted city by id.",
    type: CityDto,
    examples: {
      "application/json": {
        summary: "City DTO",
        value: {
          id: 1,
          name: "Amsterdam",
          country: "Netherlands",
          search: "Amsterdam",
          lat: 52.1234,
          lng: 12.1234,
          seaside: true,
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.citiesService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the city with id: ${id}`
      );
    }
  }
}
