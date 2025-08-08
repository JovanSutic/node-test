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
  AverageCountryPriceQueryDto,
  CityIdQueryDto,
  CreatePriceDto,
  PriceDto,
  PricePaginationDto,
  PriceQueryDto,
  UnmarkedPriceQueryDto,
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

  @Get("unmarked-prices")
  @ApiOperation({
    summary:
      "Get all prices with price = 0.01 for given country, year, and priceType",
  })
  @ApiResponse({
    status: 200,
    description: "List of unmarked prices",
    isArray: true,
    schema: {
      example: [
        {
          id: 123,
          price: 0.01,
          priceType: "CURRENT",
          cityId: 2,
          productId: 5,
          yearId: 2024,
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    },
  })
  async getUnmarkedPrices(@Query() filters: UnmarkedPriceQueryDto) {
    const { country, yearId, priceType } = filters;
    if (!country || !yearId || !priceType) {
      throw new BadRequestException(
        "country, yearId, and priceType are required"
      );
    }

    try {
      return await this.pricesService.getUnmarkedPrices(
        country,
        Number(yearId),
        priceType
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching unmarked prices"
      );
    }
  }

  @Get("average-country-prices")
  @ApiOperation({
    summary: "Get average prices per product in a specific country",
  })
  @ApiResponse({
    status: 200,
    description: "Average prices for all products in the specified country",
    isArray: true,
    type: PricePaginationDto,
    examples: {
      "application/json": {
        summary: "price DTO array",
        value: [
          {
            country: "France",
            productId: 1,
            average_price: 15.5,
            yearId: 15,
          },
          {
            country: "France",
            productId: 2,
            average_price: 23.1,
            yearId: 15,
          },
        ],
      },
    },
  })
  async getAverageCountryPrices(@Query() filters: AverageCountryPriceQueryDto) {
    const { country, yearId, priceType } = filters;
    if (!country || !yearId) {
      throw new BadRequestException("Both country and yearId are required");
    }

    try {
      return await this.pricesService.getAverageCountryPrices(
        country,
        Number(yearId),
        priceType
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching average country prices"
      );
    }
  }

  @Get("unique-cities")
  @ApiOperation({
    summary: "Get unique cityIds optionally filtered by priceType",
  })
  @ApiResponse({
    status: 200,
    description: "List of unique cityIds",
    examples: {
      "application/json": {
        summary: "List of unique cityIds",
        value: {
          data: [1, 2, 3],
          count: 3,
        },
      },
    },
  })
  async getUniqueCityIds(@Query() query: CityIdQueryDto) {
    try {
      const cityIds = await this.pricesService.getUniqueCityIds(
        query.priceType
      );
      return {
        data: cityIds,
        count: cityIds.length,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching unique cityIds"
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
