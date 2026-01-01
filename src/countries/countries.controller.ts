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
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { CreateCountryDto, CountryDto, CountryQueryDto } from "./countries.dto";
import { CountriesService } from "./countries.service";
import {
  ExistenceValidationPipe,
  UniqueExistenceValidation,
} from "./countries.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("countries")
@ApiTags("countries")
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }), ExistenceValidationPipe)
  @ApiOperation({ summary: "Create the new country." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a country",
    type: CountryDto,
    examples: {
      single: {
        summary: "Country DTO",
        value: {
          id: 1,
          name: "Italy",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new country",
    type: CreateCountryDto,
    examples: {
      single: {
        value: {
          name: "Italy",
        },
      },
      multiple: {
        value: [
          {
            name: "Italy",
          },
          {
            name: "Spain",
          },
        ],
      },
    },
  })
  async create(
    @Body() CreateCountryDto: CreateCountryDto
  ) {
    try {
      return await this.countriesService.create(CreateCountryDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the country"
      );
    }
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: "Return all countries." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved countries.",
    isArray: true,
    type: CountryDto,
    examples: {
      "application/json": {
        summary: "Country DTO array",
        value: [
          {
            id: 1,
            name: "Italy",
          },
          {
            id: 2,
            name: "Spain",
          },
        ],
      },
    },
  })
  async getAll(@Query() query: CountryQueryDto) {
    try {
      return await this.countriesService.getAll(query);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the countries"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return country by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved country by id.",
    type: CountryDto,
    examples: {
      "application/json": {
        summary: "Country DTO",
        value: {
          id: 1,
          name: "Italy",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.countriesService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the country with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Update countries" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated countries.",
    isArray: true,
    type: CountryDto,
    examples: {
      single: {
        summary: "Single updated country",
        value: {
          id: 1,
          name: "Italy",
        },
      },
      multiple: {
        summary: "Multiple updated countries",
        value: [
          {
            id: 1,
            name: "Italy",
          },
          {
            id: 2,
            name: "Spain",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update country",
    type: CreateCountryDto,
    examples: {
      single: {
        value: {
          id: 1,
          name: "Italy",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "Italy",
          },
          {
            id: 2,
            name: "Spain",
          },
        ],
      },
    },
  })
  async update(@Body() data: CountryDto[]) {
    try {
      if (data.length) {
        return await this.countriesService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple countries you need to provide array of CountryDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the countries"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete country by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted country by id.",
    type: CountryDto,
    examples: {
      "application/json": {
        summary: "country DTO",
        value: {
          id: 1,
          name: "Italy",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.countriesService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the country with id: ${id}`
      );
    }
  }
}
