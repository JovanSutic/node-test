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
} from "@nestjs/common";
import { CreateDefValueDto, DefValueDto, DefValueQueryDto } from "./def_value.dto";
import { DefValueService } from "./def_value.service";
import {
  ExistenceValidationPipe,
  ForeignKeyValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./def_value.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("def_value")
@ApiTags("def_value")
export class DefValueController {
  constructor(private readonly defValueService: DefValueService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe, ForeignKeyValidationPipe)
  @ApiOperation({ summary: "Create the new def value." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a def value",
    type: DefValueDto,
    examples: {
      single: {
        summary: "Def value DTO",
        value: {
          id: 1,
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new def value",
    type: CreateDefValueDto,
    examples: {
      single: {
        value: {
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        value: [
          {
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Assigned general practitioner (GP / medico di base)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Access to public specialists (with referral)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async create(
    @Body() CreateDefValueDto: CreateDefValueDto | CreateDefValueDto[]
  ) {
    try {
      return await this.defValueService.create(CreateDefValueDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the def value"
      );
    }
  }

  @Get("by-field")
  @ApiOperation({ summary: "Return def values by field." })
  async getByField(@Query() query: DefValueQueryDto) {
    try {
      const { field, cityId, countryId } = query;
      const cityIdNum = Number.isNaN(Number(cityId)) ? undefined : Number(cityId);
      const countryIdNum = Number.isNaN(Number(countryId)) ? undefined : Number(countryId);
      
      return this.defValueService.getByAspectFieldAndLocation(
        field,
        cityIdNum,
        countryIdNum
      );
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all def values." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved def values.",
    isArray: true,
    type: DefValueDto,
    examples: {
      "application/json": {
        summary: "Def value DTO array",
        value: [
          {
            id: 1,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Assigned general practitioner (GP / medico di base)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Access to public specialists (with referral)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.defValueService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the def values"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return def value by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved def value by id.",
    type: DefValueDto,
    examples: {
      "application/json": {
        summary: "Def value DTO",
        value: {
          id: 1,
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.defValueService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the def value with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Update def values" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated def values.",
    isArray: true,
    type: DefValueDto,
    examples: {
      single: {
        summary: "Single updated def value",
        value: {
          id: 1,
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Multiple updated def values",
        value: [
          {
            id: 1,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Assigned general practitioner (GP / medico di base)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Access to public specialists (with referral)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update def value",
    type: CreateDefValueDto,
    examples: {
      single: {
        value: {
          id: 1,
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Assigned general practitioner (GP / medico di base)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            definitionId: 1,
            cityId: null,
            countryId: 1,
            value: "Access to public specialists (with referral)",
            score: null,
            comment: null,
            note: null,
            type: "bullet",
            visible: true,
            created_at: "2025-03-26T19:50:30.809Z",
            updated_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async update(@Body() data: DefValueDto[]) {
    try {
      if (data.length) {
        return await this.defValueService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple def values you need to provide array of DefValueDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the def values"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete def value by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted def value by id.",
    type: DefValueDto,
    examples: {
      "application/json": {
        summary: "def value DTO",
        value: {
          id: 1,
          definitionId: 1,
          cityId: null,
          countryId: 1,
          value: "Assigned general practitioner (GP / medico di base)",
          score: null,
          comment: null,
          note: null,
          type: "bullet",
          visible: true,
          created_at: "2025-03-26T19:50:30.809Z",
          updated_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.defValueService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the def value with id: ${id}`
      );
    }
  }
}
