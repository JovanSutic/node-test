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
import { CreateProductDto, ProductDto } from "./products.dto";
import { ProductsService } from "./products.service";
import { ObjectTransformPipe } from "../cities/cities.validation.pipe";
import {
  ExistenceValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./products.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("products")
@ApiTags("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Create the new product." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a product",
    type: ProductDto,
    examples: {
      single: {
        summary: "Product DTO",
        value: {
          id: 1,
          name: "men shoes",
          categoryId: 5,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 10 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new product",
    type: ProductDto,
    examples: {
      single: {
        value: {
          name: "men shoes",
          categoryId: 5,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
      multiple: {
        value: [
          {
            name: "men shoes",
            categoryId: 5,
            unit: "1 pair",
            description: "1 pair of leather men shoes",
            type: "HISTORICAL"
          },
          {
            name: "internet",
            categoryId: 6,
            unit: "monthly subscription",
            description: "1 month internet subscription",
            type: "HISTORICAL"
          },
        ],
      },
    },
  })
  async create(@Body() createProductDto: CreateProductDto | CreateProductDto[]) {
    try {
      return await this.productsService.create(createProductDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || "An error occurred while creating the product"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all products." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved products.",
    isArray: true,
    type: ProductDto,
    examples: {
      "application/json": {
        summary: "Product DTO array",
        value: [
          {
            id: 1,
            name: "man shoes",
            categoryId: 5,
            unit: "1 pair",
            description: "1 pair of leather man shoes",
            type: "HISTORICAL"
          },
          {
            id: 2,
            name: "internet",
            categoryId: 6,
            unit: "monthly subscription",
            description: "1 month internet subscription",
            type: "HISTORICAL"
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.productsService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the products"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return product by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved product by id.",
    type: ProductDto,
    examples: {
      "application/json": {
        summary: "Product DTO",
        value: {
          id: 1,
          name: "men shoes",
          categoryId: 5,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.productsService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the product with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(ObjectTransformPipe, ExistenceValidationPipe)
  @ApiOperation({ summary: "Update products" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated products.",
    isArray: true,
    type: ProductDto,
    examples: {
      single: {
        summary: "Single updated product",
        value: {
          id: 1,
          name: "men shoes",
          categoryId: 5,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
      multiple: {
        summary: "Single updated product",
        value: [
          {
            id: 1,
            name: "men shoes",
            categoryId: 5,
            unit: "1 pair",
            description: "1 pair of leather men shoes",
            type: "HISTORICAL"
          },
          {
            id: 2,
            name: "internet",
            categoryId: 6,
            unit: "monthly subscription",
            description: "1 month internet subscription",
            type: "HISTORICAL"
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to create new product",
    type: ProductDto,
    examples: {
      single: {
        value: {
          id: 1,
          name: "men shoes",
          categoryId: 5,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "men shoes",
            categoryId: 5,
            unit: "1 pair",
            description: "1 pair of leather men shoes",
            type: "HISTORICAL"
          },
          {
            id: 2,
            name: "internet",
            categoryId: 6,
            unit: "monthly subscription",
            description: "1 month internet subscription",
            type: "HISTORICAL"
          },
        ],
      },
    },
  })
  async update(@Body() data: ProductDto[]) {
    try {
      if (data.length === 1) {
        const [product] = data;
        const existing = await this.productsService.getById(Number(product.id));
        if (existing) {
          return await this.productsService.updateSingle(
            Number(product.id),
            product
          );
        } else {
          throw new NotFoundException(
            `Product with ID ${product.id} not found`
          );
        }
      } else if (data.length > 1) {
        return await this.productsService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple products you need to provide array of ProductDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the products"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete product by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted product by id.",
    type: ProductDto,
    examples: {
      "application/json": {
        summary: "Product DTO",
        value: {
          id: 1,
          name: "men shoes",
          categoryId: 1,
          unit: "1 pair",
          description: "1 pair of leather men shoes",
          type: "HISTORICAL"
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      const city = await this.productsService.getById(Number(id));
      if (city) {
        return await this.productsService.delete(Number(id));
      } else {
        throw new NotFoundException(`Product with ID ${id} not found`);
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
