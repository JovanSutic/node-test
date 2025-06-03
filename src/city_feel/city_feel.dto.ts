import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class CityFeelDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cityId: number;

  @ApiProperty()
  rank: number;

  @ApiProperty({ required: false })
  tags?: string;

  @ApiProperty({ required: false })
  budget?: number;

  @ApiProperty({ required: false })
  created_at: Date;
}

export class CreateCityFeelDto {
  @ApiProperty()
  cityId: number;

  @ApiProperty()
  rank: number;

  @ApiProperty({ required: false })
  tags?: string;

  @ApiProperty({ required: false })
  budget?: number;
}

export class CityFeelQueryDto {
  @IsOptional()
  @IsNumberString()
  take?: number = 100;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";

  @IsOptional()
  @IsNumberString()
  fromId?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumberString()
  budget?: number;

  @IsOptional()
  @IsNumberString()
  rank?: number;

  @IsOptional()
  @IsNumberString()
  north?: number;

  @IsOptional()
  @IsNumberString()
  south?: number;

  @IsOptional()
  @IsNumberString()
  east?: number;

  @IsOptional()
  @IsNumberString()
  west?: number;
}