import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";
import {
  CreateCrimeAspectDto,
  CrimeAspectDto,
  CreateCrimeRankDto,
  CrimeRankDto,
  CrimeRanksQueryDto,
} from "./crimes.dto";
import { CrimesService } from "./crimes.service";
import {
  CrimeRankCreateExistencePipe,
  CrimeRankForeignKeysPipe,
  CrimeRankUpdateExistencePipe,
  CrimeRankValidationPipe,
} from "./crimes.validation.pipe";

@Controller("crimes")
@ApiTags("crimes")
export class CrimesController {
  constructor(private readonly crimeService: CrimesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(
    CrimeRankValidationPipe,
    CrimeRankCreateExistencePipe,
    CrimeRankForeignKeysPipe
  )
  @ApiOperation({ summary: "Create new crime ranks" })
  @ApiBody({
    description: "Crime rank data",
    type: CreateCrimeRankDto,
    examples: {
      single: {
        value: {
          year_id: 16,
          city_id: 1,
          crime_aspect_id: 2,
          rank: 65.2,
        },
      },
      multiple: {
        value: [
          { year_id: 16, city_id: 1, crime_aspect_id: 1, rank: 70 },
          { year_id: 16, city_id: 1, crime_aspect_id: 2, rank: 65 },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successfully created crime ranks",
    type: CrimeRankDto,
    isArray: true,
    examples: {
      single: {
        summary: "Single created crime rank",
        value: {
          id: 1,
          year_id: 16,
          city_id: 1,
          crime_aspect_id: 2,
          rank: 65.2,
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  async createRanks(@Body() data: CreateCrimeRankDto | CreateCrimeRankDto[]) {
    try {
      return await this.crimeService.createRanks(data);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "Failed to create crime ranks."
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(CrimeRankUpdateExistencePipe, CrimeRankForeignKeysPipe)
  @ApiOperation({ summary: "Update existing crime ranks" })
  @ApiBody({
    description: "Updated crime rank data",
    type: CreateCrimeRankDto,
    examples: {
      single: {
        value: [
          {
            id: 1,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 2,
            rank: 65.2,
          },
          {
            id: 2,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 3,
            rank: 15.2,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Successfully updated crime ranks",
    type: CrimeRankDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "updated crime rank",
        value: [
          {
            id: 1,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 2,
            rank: 65.2,
            created_at: "2025-05-26T18:49:49.442Z",
          },
          {
            id: 2,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 3,
            rank: 15.2,
            created_at: "2025-05-26T18:49:49.442Z",
          },
        ],
      },
    },
  })
  async updateRanks(@Body() data: CreateCrimeRankDto[]) {
    try {
      return await this.crimeService.updateRanks(data);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "Failed to update crime ranks."
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all crime ranks with optional filters" })
  @ApiResponse({
    status: 200,
    description: "All crime ranks",
    type: CrimeRankDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "updated crime rank",
        value: [
          {
            id: 1,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 2,
            rank: 65.2,
            created_at: "2025-05-26T18:49:49.442Z",
          },
          {
            id: 2,
            year_id: 16,
            city_id: 1,
            crime_aspect_id: 3,
            rank: 15.2,
            created_at: "2025-05-26T18:49:49.442Z",
          },
        ],
      },
    },
  })
  async getAllRanks(@Query() filters: CrimeRanksQueryDto) {
    try {
      return await this.crimeService.getAllRanks(filters);
    } catch (error: any) {
      throw new BadRequestException("Failed to fetch crime ranks.");
    }
  }

  @Post("aspects")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create new crime aspect" })
  @ApiBody({
    description: "Crime aspect to create",
    type: CreateCrimeAspectDto,
    examples: {
      single: {
        value: { name: "Assault" },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Crime aspect created",
    type: CrimeAspectDto,
    examples: {
      single: {
        summary: "New Crime aspect created",
        value: {
          id: 2,
          name: "Crime increasing in the past 5 years",
          created_at: "2025-05-26T18:49:49.442Z",
        },
      },
    },
  })
  async createAspect(@Body() data: CreateCrimeAspectDto) {
    try {
      return await this.crimeService.createAspect(data);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to create crime aspect."
      );
    }
  }

  @Get("aspects")
  @ApiOperation({ summary: "Get all crime aspects" })
  @ApiResponse({
    status: 200,
    description: "List of all crime aspects",
    type: CrimeAspectDto,
    isArray: true,
    examples: {
      "application/json": {
        summary: "Example response",
        value: [
          {
            id: 1,
            name: "Robbery",
            created_at: "2025-05-26T18:49:49.442Z",
          },
          {
            id: 2,
            name: "Assault",
            created_at: "2025-05-26T18:49:49.442Z",
          },
        ],
      },
    },
  })
  async getAllAspects() {
    try {
      return await this.crimeService.getAllAspects();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Failed to fetch crime aspects"
      );
    }
  }

  @Delete("aspects/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete crime aspect by ID" })
  @ApiResponse({
    status: 200,
    description: "Crime aspect deleted",
    examples: {
      "application/json": {
        summary: "Deleted Crime aspect",
        value: {
          id: 2,
          name: "Crime increasing in the past 5 years",
          created_at: "2025-05-26T18:49:49.442Z",
        },
      },
    },
  })
  async deleteAspect(@Param("id") id: string) {
    try {
      return await this.crimeService.deleteAspect(id);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        error.message || "Failed to delete crime aspect."
      );
    }
  }
}
