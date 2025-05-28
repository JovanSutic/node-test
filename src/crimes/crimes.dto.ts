import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  IsNumberString,
} from "class-validator";

export class CreateCrimeAspectDto {
  @ApiProperty({
    description: "The name of the crime aspect (e.g. 'Assault', 'Theft')",
    type: String,
  })
  @IsString()
  name: string;
}

export class CrimeAspectDto {
  @ApiProperty({
    description: "The unique identifier of crime aspect",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the crime aspect",
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The timestamp when the aspect was created",
    type: String,
    format: "date-time",
  })
  @IsDateString()
  created_at: string;
}

export class CreateCrimeRankDto {
  @ApiProperty({
    description: "The city ID this crime rank belongs to",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The year ID this crime rank is recorded for",
    type: Number,
  })
  @IsNumber()
  yearId: number;

  @ApiProperty({
    description: "The crime aspect ID",
    type: Number,
  })
  @IsNumber()
  crimeAspectId: number;

  @ApiProperty({
    description: "The crime ranking value",
    type: Number,
  })
  @IsNumber()
  rank: number;
}

export class CrimeRankDto {
  @ApiProperty({
    description: "The unique identifier of crime rank.",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The city ID",
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The year ID",
    type: Number,
  })
  @IsNumber()
  yearId: number;

  @ApiProperty({
    description: "The crime aspect ID",
    type: Number,
  })
  @IsNumber()
  crimeAspectId: number;

  @ApiProperty({
    description: "The crime rank value",
    type: Number,
  })
  @IsNumber()
  rank: number;

  @ApiProperty({
    description: "Date and time when this rank was created",
    type: String,
    format: "date-time",
  })
  @IsDateString()
  created_at: string;
}

export class CrimeRanksQueryDto {
  @ApiPropertyOptional({ description: "Filter by city ID" })
  @IsOptional()
  @IsNumberString()
  cityId?: string;

  @ApiPropertyOptional({ description: "Filter by year ID" })
  @IsOptional()
  @IsNumberString()
  yearId?: string;

  @ApiPropertyOptional({ description: "Filter by crime aspect ID" })
  @IsOptional()
  @IsNumberString()
  crimeAspectId?: string;

  @ApiPropertyOptional({
    description: "Filter ranks greater than or equal to this value",
  })
  @IsOptional()
  @IsNumberString()
  rankGte?: string;

  @ApiPropertyOptional({
    description: "Filter ranks less than or equal to this value",
  })
  @IsOptional()
  @IsNumberString()
  rankLte?: string;
}

export class CityYearQueryDto {
  @ApiProperty({ example: 199, description: "City ID to query" })
  @IsNumberString()
  cityId: number;

  @ApiProperty({ example: 16, description: "Year ID to query" })
  @IsNumberString()
  yearId: number;
}

export class CrimeSafetySummaryDto {
  @ApiProperty({
    example: 58.79,
    description: "Average score of all crime concerns",
  })
  @IsNumber()
  overallCrimeConcernIndex: number;

  @ApiProperty({
    example: 43.71,
    description: "Weighted score for personal safety (day/night)",
  })
  @IsNumber()
  personalSafetyScore: number;

  @ApiProperty({
    example: 73.2,
    description: "Score reflecting perception of rising crime",
  })
  @IsNumber()
  crimeEscalationIndicator: number;
}

export class AverageQueryDto {
  @ApiProperty({ example: 199, description: "Crime aspect ID to query" })
  @IsNumberString()
  aspectId: number;

  @ApiProperty({ example: 16, description: "Year ID to query" })
  @IsNumberString()
  yearId: number;

  @ApiPropertyOptional({
    description: "Country that we need average for.",
  })
  @IsOptional()
  @IsString()
  country?: string;
}
