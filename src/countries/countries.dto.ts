import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateCountryDto {
  @ApiProperty({
    description: "The name of the country",
    required: true,
    type: String,
  })
  @IsString()
  name: string;
}

export class CountryDto {
  @ApiProperty({
    description: "The unique identifier of the country",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the country",
    required: true,
    type: String,
  })
  @IsString()
  name: string;
}
