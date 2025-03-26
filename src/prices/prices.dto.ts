import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsEnum, IsDateString, IsOptional } from "class-validator";

export enum PriceType {
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export class CreatePriceDto {
  @ApiProperty({
    description: "The price value",
    type: Number,
  })
  @IsNumber()
  price: number;

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
