import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsBoolean } from "class-validator";

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
    description: "Name used for numbeo search",
    type: String,
  })
  @IsString()
  search: string;

  @ApiProperty({
    description: "Latitude of the city",
    type: Number,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: "Longitude of the city",
    type: Number,
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    description: "Is city on the seaside",
    type: Boolean,
  })
  @IsBoolean()
  seaside: boolean;
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
    description: "Name used for numbeo search",
    type: String,
  })
  @IsString()
  search: string;

  @ApiProperty({
    description: "Latitude of the city",
    type: Number,
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    description: "Longitude of the city",
    type: Number,
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    description: "Is city on the seaside",
    type: Boolean,
  })
  @IsBoolean()
  seaside: boolean;
}
