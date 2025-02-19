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
import { CreateCityDto } from "./cities.dto";
import { CitiesService } from "./cities.service";
import { ValidationPipe } from "./cities.validation.pipe";

@Controller("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UsePipes(ValidationPipe)
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
