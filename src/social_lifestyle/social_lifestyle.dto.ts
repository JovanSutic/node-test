import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

export enum SocialType {
  SOLO = "SOLO",
  PAIR = "PAIR",
  FAMILY = "FAMILY",
}

export class CreateSocialLifestyleDto {
  @ApiProperty({ description: "City ID", required: true, type: Number })
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: "Year ID", required: true, type: Number })
  @IsNumber()
  yearId: number;

  @ApiProperty({ description: "Average price", required: false, type: Number })
  @IsOptional()
  @IsNumber()
  avg_price?: number;

  @ApiProperty({
    description: "Currency code (e.g. EUR, USD)",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: "Type of report",
    required: false,
    type: String,
  })
  @IsOptional()
  type?: SocialType;
}

export class SocialLifestyleDto {
  @ApiProperty({
    description: "The unique identifier of the Social lifestyle report",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({ description: "City ID", required: true, type: Number })
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: "Year ID", required: true, type: Number })
  @IsNumber()
  yearId: number;

  @ApiProperty({ description: "Average price", required: false, type: Number })
  @IsOptional()
  @IsNumber()
  avg_price?: number;

  @ApiProperty({
    description: "Currency code (e.g. EUR, USD)",
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: "Type of report",
    required: false,
    enum: SocialType,
  })
  @IsEnum(SocialType)
  type?: SocialType;

  @ApiProperty({
    description: "Date when the record was created",
    example: "2025-03-26T12:00:00Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  created_at: Date;
}

export class SocialLifestyleQueryDto {
  @IsOptional()
  @IsEnum(SocialType)
  type?: SocialType;
  
  @IsOptional()
  @IsNumberString()
  cityId?: number;

  @IsOptional()
  @IsNumberString()
  yearId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;

  @IsOptional()
  @IsIn(["created_at", "avg_price", "id"])
  sortBy?: string = "created_at";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "desc";
}
