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
import { CreateAspectDto, AspectDto } from "./aspect.dto";
import { AspectService } from "./aspect.service";
import {
  ExistenceValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./aspect.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("aspect")
@ApiTags("aspect")
export class AspectController {
  constructor(private readonly aspectService: AspectService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Create the new aspect." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a aspect",
    type: AspectDto,
    examples: {
      single: {
        summary: "Aspect DTO",
        value: {
          id: 1,
          name: "insurance",
          field: "healthcare",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new aspect",
    type: CreateAspectDto,
    examples: {
      single: {
        value: {
          name: "insurance",
          field: "healthcare",
        },
      },
      multiple: {
        value: [
          {
            name: "insurance",
            field: "healthcare",
          },
          {
            name: "insurance_pricing",
            field: "healthcare",
          },
        ],
      },
    },
  })
  async create(@Body() CreateAspectDto: CreateAspectDto | CreateAspectDto[]) {
    try {
      return await this.aspectService.create(CreateAspectDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the aspect"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all aspects." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved aspects.",
    isArray: true,
    type: AspectDto,
    examples: {
      "application/json": {
        summary: "Aspect DTO array",
        value: [
          {
            id: 1,
            name: "insurance",
            field: "healthcare",
          },
          {
            id: 2,
            name: "insurance_pricing",
            field: "healthcare",
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.aspectService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the aspects"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return aspect by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved aspect by id.",
    type: AspectDto,
    examples: {
      "application/json": {
        summary: "Aspect DTO",
        value: {
          id: 1,
          name: "insurance",
          field: "healthcare",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.aspectService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the aspect with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Update aspects" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated aspects.",
    isArray: true,
    type: AspectDto,
    examples: {
      single: {
        summary: "Single updated aspect",
        value: {
          id: 1,
          name: "insurance",
          field: "healthcare",
        },
      },
      multiple: {
        summary: "Multiple updated aspects",
        value: [
          {
            id: 1,
            name: "insurance",
            field: "healthcare",
          },
          {
            id: 2,
            name: "insurance_pricing",
            field: "healthcare",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update aspect",
    type: CreateAspectDto,
    examples: {
      single: {
        value: {
          id: 1,
          name: "insurance",
          field: "healthcare",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "insurance",
            field: "healthcare",
          },
          {
            id: 2,
            name: "insurance_pricing",
            field: "healthcare",
          },
        ],
      },
    },
  })
  async update(@Body() data: AspectDto[]) {
    try {
      if (data.length) {
        return await this.aspectService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple aspects you need to provide array of AspectDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the aspects"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete aspect by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted aspect by id.",
    type: AspectDto,
    examples: {
      "application/json": {
        summary: "aspect DTO",
        value: {
          id: 1,
          name: "insurance",
          field: "healthcare",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.aspectService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the aspect with id: ${id}`
      );
    }
  }
}
