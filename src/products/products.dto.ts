import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateProductDto {
  @ApiProperty({
    description: "Product name",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Product category",
    type: String,
  })
  @IsString()
  category: string;

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
    description: "Product category",
    type: String,
  })
  @IsString()
  category: string;

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
}
