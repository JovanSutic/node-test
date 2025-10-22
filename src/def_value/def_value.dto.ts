import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
} from "class-validator";

export class CreateDefValueDto {
  @ApiProperty({
    description: "The definition id of the def value",
    required: true,
    type: Number,
  })
  @IsNumber()
  definitionId: number;

  @ApiProperty({
    description: "The city id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiProperty({
    description: "The country id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  @ApiProperty({
    description: "The type of the def value",
    required: true,
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "The value of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    description: "The score of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiProperty({
    description: "The comment of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "The note of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: "The note of the def value",
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  visible: boolean;
}

export class DefValueDto {
  @ApiProperty({
    description: "The unique identifier of the definition",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The definition id of the def value",
    required: true,
    type: Number,
  })
  @IsNumber()
  definitionId: number;

  @ApiProperty({
    description: "The city id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number | null;

  @ApiProperty({
    description: "The country id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  countryId?: number | null;

  @ApiProperty({
    description: "The type of the def value",
    required: true,
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "The value of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  value?: string | null;

  @ApiProperty({
    description: "The score of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  score?: number | null;

  @ApiProperty({
    description: "The comment of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  comment?: string | null;

  @ApiProperty({
    description: "The note of the def value",
    type: String,
  })
  @IsOptional()
  @IsString()
  note?: string | null;

  @ApiProperty({
    description: "The note of the def value",
    required: true,
    type: Boolean,
  })
  @IsBoolean()
  visible: boolean;

  @ApiProperty({
    description: "Date when the record was created",
    example: "2025-03-26T12:00:00Z",
  })
  @IsDateString()
  created_at: Date;

  @ApiProperty({
    description: "Date when the record was updated",
    example: "2025-03-26T12:00:00Z",
    required: false,
  })
  @IsDateString()
  updated_at: Date;
}

export class DefValueQueryDto {
  @ApiProperty({
    description: "The field of the aspect",
    type: String,
  })
  @IsString()
  field: string;

  @IsOptional()
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The country id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  countryId: number;

  @ApiProperty({
    description: "The definition id of the def value",
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  definitionId?: number;
}


