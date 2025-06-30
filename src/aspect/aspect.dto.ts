import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class CreateAspectDto {
  @ApiProperty({
    description: "The name of the aspect",
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The field of the aspect",
    required: true,
    type: String,
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: "The scope of the aspect",
    type: String,
  })
  @IsString()
  @IsOptional()
  scope?: string;
}

export class AspectDto {
  @ApiProperty({
    description: "The unique identifier of the aspect",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The name of the aspect",
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The field of the aspect",
    type: String,
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: "The scope of the aspect",
    type: String,
  })
  @IsString()
  @IsOptional()
  scope?: string;
}
