import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate, IsNumber, IsDateString } from "class-validator";

export class WeathersDto {
  @ApiProperty({ description: "Unique weather record ID" })
  @IsNumber()
  id: number;

  @ApiProperty({ description: "ID of the city this weather data belongs to" })
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: "Number of sunshine days per year" })
  @IsNumber()
  sunshine: number;

  @ApiProperty({ description: "Number of rainy days per year" })
  @IsNumber()
  rain: number;

  @ApiProperty({ description: "Number of cold days per year (<10°C)" })
  @IsNumber()
  cold: number;

  @ApiProperty({ description: "Number of hot days per year (>25°C)" })
  @IsNumber()
  heat: number;

  @ApiProperty({ description: "Number of extreme cold days per year (<0°C)" })
  @IsNumber()
  cold_extremes: number;

  @ApiProperty({ description: "Number of extreme heat days per year (>35°C)" })
  @IsNumber()
  heat_extremes: number;

  @ApiProperty({ description: "Average annual humidity (%)" })
  @IsNumber()
  humidity: number;

  @ApiProperty({ description: "Description of severe weather risk" })
  @IsString()
  severe: string;

  @ApiProperty({ description: "Lowest recorded temperature (°C)" })
  @IsNumber()
  lowest: number;

  @ApiProperty({ description: "Highest recorded temperature (°C)" })
  @IsNumber()
  highest: number;

  @ApiProperty({ description: "Date when this record was created" })
  @IsDateString()
  created_at: string;
}

export class CreateWeathersDto {
  @ApiProperty({ description: "ID of the city this weather data belongs to" })
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: "Number of sunshine days per year" })
  @IsNumber()
  sunshine: number;

  @ApiProperty({ description: "Number of rainy days per year" })
  @IsNumber()
  rain: number;

  @ApiProperty({ description: "Number of cold days per year (<10°C)" })
  @IsNumber()
  cold: number;

  @ApiProperty({ description: "Number of hot days per year (>25°C)" })
  @IsNumber()
  heat: number;

  @ApiProperty({ description: "Number of extreme cold days per year (<0°C)" })
  @IsNumber()
  cold_extremes: number;

  @ApiProperty({ description: "Number of extreme heat days per year (>35°C)" })
  @IsNumber()
  heat_extremes: number;

  @ApiProperty({ description: "Average annual humidity (%)" })
  @IsNumber()
  humidity: number;

  @ApiProperty({ description: "Description of severe weather risk" })
  @IsString()
  severe: string;

  @ApiProperty({ description: "Lowest recorded temperature (°C)" })
  @IsNumber()
  lowest: number;

  @ApiProperty({ description: "Highest recorded temperature (°C)" })
  @IsNumber()
  highest: number;
}
