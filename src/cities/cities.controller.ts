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
} from "@nestjs/common";
import { CreateCityDto, CityDto } from "./cities.dto";
import { CitiesService } from "./cities.service";
import { ObjectTransformPipe, ValidationPipe } from "./cities.validation.pipe";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("cities")
@ApiTags("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: "Create the new city." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a city",
    type: CityDto,
  })
  async create(@Body() createCityDto: CreateCityDto) {
    try {
      const city = await this.citiesService.getByEssentialData(
        createCityDto.name,
        createCityDto.country
      );
      if (city) {
        throw new ConflictException(
          "City with this name and country already exists"
        );
      } else {
        return await this.citiesService.create(createCityDto);
      }
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
  @ApiOperation({ summary: "Return city by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved city by id.",
    type: CityDto,
  })
  async getById(@Param("id") id: string) {
    try {
      const result = await this.citiesService.getById(Number(id));
      if (!result) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }
      return result;
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
  @UsePipes(ObjectTransformPipe)
  @ApiOperation({ summary: "Update cities" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated cities cities.",
    isArray: true,
    type: CityDto,
  })
  async update(@Body() data: CityDto[]) {
    try {
      if (data.length === 1) {
        const [city] = data;
        const existing = await this.citiesService.getById(Number(city.id));
        if (existing) {
          return await this.citiesService.updateSingle(Number(city.id), city);
        } else {
          throw new NotFoundException(`City with ID ${city.id} not found`);
        }
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
  @ApiOperation({ summary: "Delete city by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted city by id.",
    type: CityDto,
  })
  async delete(@Param("id") id: string) {
    try {
      const city = await this.citiesService.getById(Number(id));
      if (city) {
        return await this.citiesService.delete(Number(id));
      } else {
        throw new NotFoundException(`City with ID ${id} not found`);
      }
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
