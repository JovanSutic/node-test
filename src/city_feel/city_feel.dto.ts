import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumberString, IsOptional, IsString } from "class-validator";

export class CityFeelDto {
  @ApiProperty({ description: "City Feel ID" })
  id: number;

  @ApiProperty({ description: "City Feel city ID" })
  cityId: number;

  @ApiProperty({ description: "City Feel rank" })
  rank: number;

  @ApiProperty({
    description: "City Feel tags",
    required: false,
    nullable: true,
  })
  tags?: string | null;

  @ApiProperty({
    description: "City Feel budget",
    required: false,
    nullable: true,
  })
  budget?: number | null;

  @ApiProperty({ description: "City Feel date of creation", required: false })
  created_at: Date;
}

export class CreateCityFeelDto {
  @ApiProperty({ description: "City Feel city ID" })
  cityId: number;

  @ApiProperty({ description: "City Feel rank" })
  rank: number;

  @ApiProperty({
    description: "City Feel tags",
    required: false,
    nullable: true,
  })
  tags?: string | null;

  @ApiProperty({
    description: "City Feel budget",
    required: false,
    nullable: true,
  })
  budget?: number | null;
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

  @IsOptional()
  @IsNumberString()
  size?: number;

  @IsOptional()
  @IsString()
  seaside?: string;
}
