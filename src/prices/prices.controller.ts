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
import {
  CreatePriceDto,
  PriceDto,
  PricePaginationDto,
  PriceQueryDto,
} from "./prices.dto";
import { PricesService } from "./prices.service";
import {
  StaticFieldValidationPipe,
  ForeignKeyValidationPipe,
  ExistenceValidationPipe,
  UniqueExistenceValidation,
} from "./prices.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("prices")
@ApiTags("prices")
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(
    StaticFieldValidationPipe,
    ForeignKeyValidationPipe,
    ExistenceValidationPipe
  )
  @ApiOperation({ summary: "Create the new price." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a price",
    type: PriceDto,
    examples: {
      single: {
        summary: "Price DTO",
        value: {
          id: 1,
          price: 300,
          top: 500,
          bottom: 200,
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
        summary: "Count",
        value: { count: 100 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new price",
    type: CreatePriceDto,
    examples: {
      single: {
        value: {
          price: 300,
          top: 500,
          bottom: 200,
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
            price: 300,
            top: 500,
            bottom: 200,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
          },
          {
            price: 200,
            top: 500,
            bottom: 200,
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
  async create(@Body() createPriceDto: CreatePriceDto | CreatePriceDto[]) {
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
    type: PricePaginationDto,
    examples: {
      "application/json": {
        summary: "price DTO array",
        value: {
          data: [
            {
              id: 1,
              price: 300,
              top: 500,
              bottom: 200,
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
              top: 500,
              bottom: 200,
              currency: "EUR",
              cityId: 1,
              productId: 1,
              yearId: 1,
              priceType: "HISTORICAL",
              createdAt: "2025-03-26T19:50:30.809Z",
              updatedAt: "2025-03-26T19:50:30.809Z",
            },
          ],
          total: 100,
          limit: 10,
          page: 1,
        },
      },
    },
  })
  async getAll(@Query() filters: PriceQueryDto) {
    try {
      return await this.pricesService.getAll(filters);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the prices"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
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
          top: 500,
          bottom: 200,
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
      return await this.pricesService.getById(Number(id));
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
  @UsePipes(
    StaticFieldValidationPipe,
    ForeignKeyValidationPipe,
    ExistenceValidationPipe
  )
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
          top: 500,
          bottom: 200,
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
            top: 500,
            bottom: 200,
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
            top: 500,
            bottom: 200,
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
            top: 500,
            bottom: 200,
            currency: "EUR",
            cityId: 1,
            productId: 1,
            yearId: 1,
            priceType: "HISTORICAL",
          },
          {
            id: 2,
            price: 300,
            top: 500,
            bottom: 200,
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
        return await this.pricesService.updateSingle(Number(price.id), price);
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
  @UsePipes(UniqueExistenceValidation)
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
          top: 500,
          bottom: 200,
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
      return await this.pricesService.delete(Number(id));
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
