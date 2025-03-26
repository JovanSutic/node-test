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
import { CreatePriceDto, PriceDto } from "./prices.dto";
import { PricesService } from "./prices.service";
import {
  StaticFieldValidationPipe,
  ForeignKeyValidationPipe,
} from "./prices.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("prices")
@ApiTags("prices")
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(StaticFieldValidationPipe, ForeignKeyValidationPipe)
  @ApiOperation({ summary: "Create the new price." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a price",
    type: PriceDto,
    examples: {
      "application/json": {
        summary: "Price DTO",
        value: {
          id: 1,
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
          createdAt: "2025-03-26T19:50:30.809Z",
          updatedAt: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  @ApiBody({
    description: "The data to create new price",
    type: CreatePriceDto,
    examples: {
      "application/json": {
        value: {
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
        },
      },
    },
  })
  async create(@Body() createPriceDto: CreatePriceDto) {
    try {
      return await this.pricesService.create(createPriceDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the price"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all prices." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved prices.",
    isArray: true,
    type: PriceDto,
    examples: {
      "application/json": {
        summary: "price DTO array",
        value: [
          {
            id: 1,
            price: 300,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
            createdAt: "2025-03-26T19:50:30.809Z",
            updatedAt: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            price: 400,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
            createdAt: "2025-03-26T19:50:30.809Z",
            updatedAt: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async getAll() {
    try {
      return await this.pricesService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the prices"
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Return price by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved price by id.",
    type: PriceDto,
    examples: {
      "application/json": {
        summary: "Price DTO",
        value: {
          id: 1,
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
          createdAt: "2025-03-26T19:50:30.809Z",
          updatedAt: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      const result = await this.pricesService.getById(Number(id));
      if (!result) {
        throw new NotFoundException(`Price with ID ${id} not found`);
      }
      return result;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the price with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(StaticFieldValidationPipe, ForeignKeyValidationPipe)
  @ApiOperation({ summary: "Update prices" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated prices.",
    isArray: true,
    type: PriceDto,
    examples: {
      single: {
        summary: "Single updated price",
        value: {
          id: 1,
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
          createdAt: "2025-03-26T19:50:30.809Z",
          updatedAt: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Multiple updated prices",
        value: [
          {
            id: 1,
            price: 300,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
            createdAt: "2025-03-26T19:50:30.809Z",
            updatedAt: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            price: 400,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
            createdAt: "2025-03-26T19:50:30.809Z",
            updatedAt: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update price",
    type: CreatePriceDto,
    examples: {
      single: {
        value: {
          id: 1,
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
        },
      },
      multiple: {
        value: [
          {
            id: 1,
            price: 300,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
          },
          {
            id: 2,
            price: 300,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
          },
        ],
      },
    },
  })
  async update(@Body() data: PriceDto[]) {
    try {
      if (data.length === 1) {
        const [price] = data;
        const existing = await this.pricesService.getById(Number(price.id));
        if (existing) {
          return await this.pricesService.updateSingle(Number(price.id), price);
        } else {
          throw new NotFoundException(`price with ID ${price.id} not found`);
        }
      } else if (data.length > 1) {
        return await this.pricesService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple prices you need to provide array of PriceDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the prices"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete price by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted price by id.",
    type: PriceDto,
    examples: {
      "application/json": {
        summary: "Price DTO",
        value: {
          id: 1,
          price: 300,
          currency: "EUR",
          cityId: 1,
          productId: 1,
          yearId: 1,
          priceType: "HISTORICAL",
          createdAt: "2025-03-26T19:50:30.809Z",
          updatedAt: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      const price = await this.pricesService.getById(Number(id));
      if (price) {
        return await this.pricesService.delete(Number(id));
      } else {
        throw new NotFoundException(`Price with ID ${id} not found`);
      }
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the price with id: ${id}`
      );
    }
  }
}
