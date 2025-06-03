import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateCityContextDto {
  @ApiProperty({
    description: "The city ID this context profile belongs to",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "Climate description (e.g. Tropical, Temperate, etc.)",
    type: String,
  })
  @IsString()
  climate: string;

  @ApiProperty({
    description: "Tourism level (e.g. High, Moderate, Low)",
    type: String,
  })
  @IsString()
  tourismLevel: string;

  @ApiProperty({
    description: "Expat community size or presence",
    type: String,
  })
  @IsString()
  expatCommunity: string;

  @ApiProperty({
    description: "Access to nature (e.g. parks, beaches, forests)",
    type: String,
  })
  @IsString()
  natureAccess: string;

  @ApiProperty({
    description: "Description of the local lifestyle",
    type: String,
  })
  @IsString()
  localLifestyle: string;

  @ApiProperty({
    description: "Seasonality pattern (e.g. rainy season, dry season)",
    type: String,
  })
  @IsString()
  seasonality: string;

  @ApiProperty({
    description: "Cultural highlights and points of interest",
    type: String,
  })
  @IsString()
  cultureHighlights: string;

  @ApiProperty({
    description: "Available sports and outdoor activities",
    type: String,
  })
  @IsString()
  sportsAndActivities: string;

  @ApiProperty({
    description: "Detailed lifestyle story or narrative for the city",
    type: String,
  })
  @IsString()
  detailedStory: string;
}

export class CityContextDto {
  @ApiProperty({
    description: "The city ID this context profile belongs to",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "Climate description (e.g. Tropical, Temperate, etc.)",
    type: String,
  })
  @IsString()
  climate: string;

  @ApiProperty({
    description: "Tourism level (e.g. High, Moderate, Low)",
    type: String,
  })
  @IsString()
  tourismLevel: string;

  @ApiProperty({
    description: "Expat community size or presence",
    type: String,
  })
  @IsString()
  expatCommunity: string;

  @ApiProperty({
    description: "Access to nature (e.g. parks, beaches, forests)",
    type: String,
  })
  @IsString()
  natureAccess: string;

  @ApiProperty({
    description: "Description of the local lifestyle",
    type: String,
  })
  @IsString()
  localLifestyle: string;

  @ApiProperty({
    description: "Seasonality pattern (e.g. rainy season, dry season)",
    type: String,
  })
  @IsString()
  seasonality: string;

  @ApiProperty({
    description: "Cultural highlights and points of interest",
    type: String,
  })
  @IsString()
  cultureHighlights: string;

  @ApiProperty({
    description: "Available sports and outdoor activities",
    type: String,
  })
  @IsString()
  sportsAndActivities: string;

  @ApiProperty({
    description: "Detailed lifestyle story or narrative for the city",
    type: String,
  })
  @IsString()
  detailedStory: string;

  @ApiProperty({
    description: "Date and time when this rank was created",
    type: String,
    format: "date-time",
  })
  @IsDateString()
  created_at: string;

  @ApiProperty({
    description: "Date and time when this rank was updated",
    type: String,
    format: "date-time",
  })
  @IsDateString()
  updated_at: string;
}

export class CityContextQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() cityId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() offset?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(["asc", "desc"]) order?:
    | "asc"
    | "desc";
}
