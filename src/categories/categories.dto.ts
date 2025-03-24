import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "The name of the category",
    required: true,
    type: String,
  })
  @IsString()
  name: string;
}

export class CategoryDto {
  @ApiProperty({
    description: "The unique identifier of the category",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the category",
    required: true,
    type: String,
  })
  @IsString()
  name: string;
}
