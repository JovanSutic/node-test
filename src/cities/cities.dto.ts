import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class CreateCityDto {
  @ApiProperty({
    description: "The name of the city",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The country where the city is located",
    type: String,
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: "The numbeo ID for the city",
    type: Number,
  })
  @IsNumber()
  numbeo_id: number;
}

export class CityDto {
  @ApiProperty({
    description: "The unique identifier of the city",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the city",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The country where the city is located",
    type: String,
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: "The numbeo ID for the city",
    type: Number,
  })
  @IsNumber()
  numbeo_id: number;
}
