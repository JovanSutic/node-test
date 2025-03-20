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
import { ValidationPipe } from "./products.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("products")
@ApiTags("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create the new product." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a product",
    type: ProductDto,
    examples: {
      "application/json": {
        summary: "Product DTO",
        value: {
          id: 1,
          name: "men shoes",
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
        },
      },
    },
  })
  @ApiBody({
    description: "The data to create new product",
    type: ProductDto,
    examples: {
      "application/json": {
        value: {
          name: "men shoes",
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
        },
      },
    },
  })
  async create(@Body() createProductDto: CreateProductDto) {
    try {
      const product = await this.productsService.getByName(
        createProductDto.name
      );
      if (product) {
        throw new ConflictException("Product with this name already exists");
      } else {
        return await this.productsService.create(createProductDto);
      }
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
            category: "clothing and shoes",
            unit: "1 pair",
            description: "1 pair of leather man shoes",
          },
          {
            id: 2,
            name: "internet",
            category: "utilities",
            unit: "monthly subscription",
            description: "1 month internet subscription",
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
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      const result = await this.productsService.getById(Number(id));
      if (!result) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return result;
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
  @UsePipes(ObjectTransformPipe)
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
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
        },
      },
      multiple: {
        summary: "Single updated product",
        value: [
          {
            id: 1,
            name: "men shoes",
            category: "clothing and shoes",
            unit: "1 pair",
            description: "1 pair of leather men shoes",
          },
          {
            id: 2,
            name: "internet",
            category: "utilities",
            unit: "monthly subscription",
            description: "1 month internet subscription",
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
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            name: "men shoes",
            category: "clothing and shoes",
            unit: "1 pair",
            description: "1 pair of leather men shoes",
          },
          {
            id: 2,
            name: "internet",
            category: "utilities",
            unit: "monthly subscription",
            description: "1 month internet subscription",
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
          category: "clothing and shoes",
          unit: "1 pair",
          description: "1 pair of leather men shoes",
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
