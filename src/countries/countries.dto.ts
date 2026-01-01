import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCountryDto {
  @ApiProperty({
    description: "The name of the country",
    required: true,
    type: String,
    minLength: 3,
    example: "Italy",
  })
  @IsString()
  @MinLength(3, { message: "Name must be at least 3 characters" })
  name: string;
}

export class CountryDto {
  @ApiProperty({
    description: "The unique identifier of the country",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the country",
    required: true,
    type: String,
  })
  @IsString()
  name: string;
}

export class CountryQueryDto {
  @ApiPropertyOptional({
    description: "Filter countries by definition id",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  definitionId?: number;

  @ApiPropertyOptional({
    description: "Field used to order countries",
    example: "name",
    enum: ["id", "name"],
  })
  @IsOptional()
  @IsIn(["id", "name"])
  orderBy?: "id" | "name";

  @ApiPropertyOptional({
    description: "Ordering direction",
    example: "asc",
    enum: ["asc", "desc"],
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";
}
