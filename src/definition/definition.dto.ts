import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class CreateDefinitionDto {
  @ApiProperty({
    description: "The label of the definition",
    required: true,
    type: String,
  })
  @IsString()
  label: string;

  @ApiProperty({
    description: "The type of the definition",
    required: true,
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "The id of the aspect of the definition",
    required: true,
    type: Number,
  })
  @IsNumber()
  aspectId: number;
}

export class DefinitionDto {
  @ApiProperty({
    description: "The unique identifier of the definition",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The label of the definition",
    required: true,
    type: String,
  })
  @IsString()
  label: string;

  @ApiProperty({
    description: "The type of the definition",
    required: true,
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: "The id of the aspect of the definition",
    required: true,
    type: Number,
  })
  @IsNumber()
  aspectId: number;
}
