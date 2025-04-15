import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { YearsService } from "./years.service";
import { CreateYearDto, YearDto } from "./years.dto";
import {
  ExistenceValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./years.validation.pipe";
import { AuthGuard } from "../utils/auth.guard";

@Controller("years")
@ApiTags("years")
export class YearsController {
  constructor(private readonly yearsService: YearsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Create new year." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a year",
    type: YearDto,
    examples: {
      single: {
        summary: "Year DTO",
        value: {
          id: 1,
          year: 2020,
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
    type: CreateYearDto,
    examples: {
      single: {
        value: {
          year: 2020,
        },
      },
      multiple: {
        value: [
          {
            year: 2020,
          },
          {
            year: 2021,
          },
        ],
      },
    },
  })
  async create(@Body() createYearDto: CreateYearDto) {
    try {
      return await this.yearsService.create(createYearDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the year"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all years." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved years.",
    isArray: true,
    type: YearDto,
    examples: {
      "application/json": {
        summary: "Year DTO array",
        value: [
          {
            id: 1,
            year: 2020,
          },
          {
            id: 2,
            year: 2021,
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.yearsService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all years"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return year by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved year by id.",
    type: YearDto,
    examples: {
      "application/json": {
        summary: "Year DTO",
        value: {
          id: 1,
          year: 2020,
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.yearsService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the year with id: ${id}`
      );
    }
  }
}
