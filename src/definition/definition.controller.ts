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
import { CreateDefinitionDto, DefinitionDto } from "./definition.dto";
import { DefinitionService } from "./definition.service";
import {
  ExistenceValidationPipe,
  ForeignKeyValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./definition.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("definition")
@ApiTags("definition")
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe, ForeignKeyValidationPipe)
  @ApiOperation({ summary: "Create the new definition." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a definition",
    type: DefinitionDto,
    examples: {
      single: {
        summary: "Definition DTO",
        value: {
          id: 1,
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new definition",
    type: CreateDefinitionDto,
    examples: {
      single: {
        value: {
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
      multiple: {
        value: [
          {
            label: "Tier 3 – SSN Only",
            type: "text_list",
            aspectId: 1,
          },
          {
            label: "Tier 2 – SSN + Supplemental Private",
            type: "text_list",
            aspectId: 1,
          },
        ],
      },
    },
  })
  async create(
    @Body() CreateDefinitionDto: CreateDefinitionDto | CreateDefinitionDto[]
  ) {
    try {
      return await this.definitionService.create(CreateDefinitionDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the definition"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all definitions." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved definitions.",
    isArray: true,
    type: DefinitionDto,
    examples: {
      "application/json": {
        summary: "Definition DTO array",
        value: [
          {
            id: 1,
            label: "Tier 3 – SSN Only",
            type: "text_list",
            aspectId: 1,
          },
          {
            id: 2,
            label: "Tier 2 – SSN + Supplemental Private",
            type: "text_list",
            aspectId: 1,
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.definitionService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the definitions"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return definition by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved definition by id.",
    type: DefinitionDto,
    examples: {
      "application/json": {
        summary: "Definition DTO",
        value: {
          id: 1,
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.definitionService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the definition with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Update definitions" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated definitions.",
    isArray: true,
    type: DefinitionDto,
    examples: {
      single: {
        summary: "Single updated definition",
        value: {
          id: 1,
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
      multiple: {
        summary: "Multiple updated definitions",
        value: [
          {
            id: 1,
            label: "Tier 3 – SSN Only",
            type: "text_list",
            aspectId: 1,
          },
          {
            id: 2,
            label: "Tier 2 – SSN + Supplemental Private",
            type: "text_list",
            aspectId: 1,
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update definition",
    type: CreateDefinitionDto,
    examples: {
      single: {
        value: {
          id: 1,
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            label: "Tier 3 – SSN Only",
            type: "text_list",
            aspectId: 1,
          },
          {
            id: 2,
            label: "Tier 2 – SSN + Supplemental Private",
            type: "text_list",
            aspectId: 1,
          },
        ],
      },
    },
  })
  async update(@Body() data: DefinitionDto[]) {
    try {
      if (data.length) {
        return await this.definitionService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple definitions you need to provide array of DefinitionDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the definitions"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete definition by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted definition by id.",
    type: DefinitionDto,
    examples: {
      "application/json": {
        summary: "definition DTO",
        value: {
          id: 1,
          label: "Tier 3 – SSN Only",
          type: "text_list",
          aspectId: 1,
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.definitionService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the definition with id: ${id}`
      );
    }
  }
}
