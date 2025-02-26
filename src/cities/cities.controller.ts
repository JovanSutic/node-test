import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateCityDto, CityDto } from "./cities.dto";
import { CitiesService } from "./cities.service";
import { ValidationPipe } from "./cities.validation.pipe";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("cities")
@ApiTags("users")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: "Create a city." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a city",
    type: CityDto,
  })
  async create(@Body() createCityDto: CreateCityDto) {
    try {
      return await this.citiesService.create(createCityDto);
    } catch (error: any) {
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
}
