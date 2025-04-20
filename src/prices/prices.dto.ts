import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export enum PriceType {
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class CreatePriceDto {
  @ApiProperty({
    description: "The price value",
    type: Number,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: "Top of the price range",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  top: number;

  @ApiProperty({
    description: "Bottom of the price range",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bottom: number;

  @ApiProperty({
    description: "The currency of the price",
    type: String,
  })
  @IsNumber()
  currency: string;

  @ApiProperty({
    description: "The id of the city (cities table foreign key)",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The id of the product (products table foreign key)",
    type: Number,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: "The id of the year (years table foreign key)",
    type: Number,
  })
  @IsNumber()
  yearId: number;

  @ApiProperty({
    description: "Price Type",
    enum: PriceType,
  })
  @IsEnum(PriceType)
  priceType: PriceType;
}

export class PriceDto {
  @ApiProperty({
    description: "The unique identifier of the price",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The price value",
    type: Number,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: "Top of the price range",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  top: number;

  @ApiProperty({
    description: "Bottom of the price range",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  bottom: number;

  @ApiProperty({
    description: "The currency of the price",
    type: String,
  })
  @IsNumber()
  currency: string;

  @ApiProperty({
    description: "The id of the city (cities table foreign key)",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The id of the product (products table foreign key)",
    type: Number,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: "The id of the year (years table foreign key)",
    type: Number,
  })
  @IsNumber()
  yearId: number;

  @ApiProperty({
    description: "Date when the record was created",
    example: "2025-03-26T12:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: "Date when the record was last updated",
    example: "2025-03-26T12:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    description: "Price Type",
    enum: PriceType,
  })
  @IsEnum(PriceType)
  priceType: PriceType;
}

export class PricePaginationDto {
  @ApiProperty({
    type: [PriceDto],
    description: "Array of prices matching the query filters",
  })
  data: PriceDto[];

  @ApiProperty({
    description: "Total number of prices matching the query filters",
    example: 100,
    type: Number,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: "Limit of items per page",
    example: 10,
    type: Number,
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: "Offset of items to skip for pagination",
    example: 1,
    type: Number,
  })
  @IsNumber()
  offset: number;
}

export class PriceQueryDto {
  @ApiPropertyOptional({ example: "EUR" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  yearId?: number;

  @ApiPropertyOptional({ enum: PriceType, example: "HISTORICAL" })
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @ApiPropertyOptional({ example: 10, description: "Items per page" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: "Items to skip" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    example: "createdAt",
    description: "Field to sort by",
  })
  @IsOptional()
  @IsString()
  sortBy?: keyof PriceQueryDto | "price" | "createdAt" | "updatedAt";

  @ApiPropertyOptional({
    example: "desc",
    enum: SortOrder,
    description: "Sort order: asc or desc",
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}

export class CityIdQueryDto {
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;
}
