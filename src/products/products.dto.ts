import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional, IsEnum } from "class-validator";

export enum ProductType {
  ALL = "ALL",
  CURRENT = "CURRENT",
  HISTORICAL = "HISTORICAL",
}

export class CreateProductDto {
  @ApiProperty({
    description: "Product name",
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Category id of the product",
    required: true,
    type: Number,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: "Product unit",
    type: String,
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: "Product description, optional",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Product Type",
    enum: ProductType,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;
}

export class ProductDto {
  @ApiProperty({
    description: "The unique identifier of the product",
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "Product name",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Category id of the product",
    type: Number,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: "Product unit",
    type: String,
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: "Product description, optional",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Product Type",
    enum: ProductType,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;
}
