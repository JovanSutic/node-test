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
import { CreateCategoryDto, CategoryDto } from "./categories.dto";
import { CategoriesService } from "./categories.service";
import {
  ExistenceValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./categories.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("categories")
@ApiTags("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Create the new category." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a category",
    type: CategoryDto,
    examples: {
      single: {
        summary: "Category DTO",
        value: {
          id: 1,
          name: "Markets",
        },
      },
      multiple: {
        summary: "Category DTO array",
        value: [
          {
            id: 1,
            name: "Markets",
          },
          {
            id: 2,
            name: "Restaurants",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to create new category",
    type: CreateCategoryDto,
    examples: {
      single: {
        value: {
          name: "Markets",
        },
      },
      multiple: {
        value: [
          {
            name: "Markets",
          },
          {
            name: "Restaurants",
          },
        ],
      },
    },
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto | CreateCategoryDto[]
  ) {
    try {
      return await this.categoriesService.create(createCategoryDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the category"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all categories." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved categories.",
    isArray: true,
    type: CategoryDto,
    examples: {
      "application/json": {
        summary: "Category DTO array",
        value: [
          {
            id: 1,
            name: "Markets",
          },
          {
            id: 2,
            name: "Restaurants",
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.categoriesService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the categories"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return category by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved category by id.",
    type: CategoryDto,
    examples: {
      "application/json": {
        summary: "Category DTO",
        value: {
          id: 1,
          name: "Markets",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.categoriesService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the category with id: ${id}`
      );
    }
  }

  @Put()
  // @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Update categories" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated categories.",
    isArray: true,
    type: CategoryDto,
    examples: {
      single: {
        summary: "Single updated category",
        value: {
          id: 1,
          name: "Markets",
        },
      },
      multiple: {
        summary: "Multiple updated categories",
        value: [
          {
            id: 1,
            name: "Markets",
          },
          {
            id: 2,
            name: "Restaurants",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update category",
    type: CreateCategoryDto,
    examples: {
      single: {
        value: {
          id: 1,
          name: "Markets",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "Markets",
          },
          {
            id: 2,
            name: "Restaurants",
          },
        ],
      },
    },
  })
  async update(@Body() data: CategoryDto[]) {
    try {
      if (data.length === 1) {
        const [category] = data;
        return await this.categoriesService.updateSingle(
          Number(category.id),
          category
        );
      } else if (data.length > 1) {
        return await this.categoriesService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple categories you need to provide array of CategoryDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the categories"
      );
    }
  }

  @Delete(":id")
  // @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete category by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted category by id.",
    type: CategoryDto,
    examples: {
      "application/json": {
        summary: "category DTO",
        value: {
          id: 1,
          name: "Markets",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.categoriesService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the category with id: ${id}`
      );
    }
  }
}
