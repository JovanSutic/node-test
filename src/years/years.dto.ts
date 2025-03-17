import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateYearDto {
  @ApiProperty({
    description: "The year number",
    type: Number,
  })
  @IsNumber()
  year: number;
}

export class YearDto {
  @ApiProperty({
    description: "The unique identifier of the year",
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The year number",
    required: true,
    type: Number,
  })
  @IsNumber()
  year: number;
}
