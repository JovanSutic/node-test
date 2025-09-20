import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsIn,
  IsNumberString,
  IsEnum,
  IsBooleanString,
} from "class-validator";
import { PriceType } from "../prices/prices.dto";

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

  @ApiProperty({
    description: "The number of inhabitants of the city",
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  size: number;

  @ApiProperty({
    description: "The unique identifier of the country",
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  countriesId?: number;
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

  @ApiProperty({
    description: "The number of inhabitants of the city",
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  size: number;

  @ApiProperty({
    description: "The unique identifier of the country",
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  countriesId?: number;
}

export class CitiesQueryDto {
  @IsOptional()
  @IsNumberString()
  north?: string;

  @IsOptional()
  @IsNumberString()
  south?: string;

  @IsOptional()
  @IsNumberString()
  east?: string;

  @IsOptional()
  @IsNumberString()
  west?: string;

  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value, 10), 100))
  @IsNumberString()
  take?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";

  @IsOptional()
  @IsNumberString()
  fromId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBooleanString()
  seaside?: string;

  @IsOptional()
  @IsNumberString()
  size?: string;

  @IsOptional()
  @IsNumberString()
  offset?: string;
}

export class CitiesMissingDto {
  @IsEnum(PriceType)
  priceType: PriceType;

  @IsNumberString()
  yearId: string;

  @IsOptional()
  @IsNumberString()
  lessThan?: string;
}
