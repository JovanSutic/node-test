import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNumber, IsOptional, IsInt } from "class-validator";

export class CreateLayerTypeDto {
  @ApiProperty({
    description: "The name of the layer type",
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "The type of the layer type",
    required: true,
    type: String,
  })
  @IsString()
  type: string;
}

export class LayerTypeDto extends CreateLayerTypeDto {
  @ApiProperty({
    description: "The unique identifier of the layer type",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;
}

export class CreateLayerDto {
  @ApiProperty({
    description: "The ID of the city this layer belongs to",
    required: true,
    type: Number,
  })
  @IsNumber()
  cityId: number;

  @ApiProperty({
    description: "The ID of the layer type",
    required: true,
    type: Number,
  })
  @IsNumber()
  layerTypeId: number;

  @ApiProperty({
    description: "The numerical value of the layer (if applicable)",
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiProperty({
    description: "The string representation of the value (if applicable)",
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  value_string?: string;
}

export class LayerDto extends CreateLayerDto {
  @ApiProperty({
    description: "The unique identifier of the layer",
    required: true,
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "The creation date of the layer",
    required: true,
    type: String,
    format: "date-time",
  })
  @IsString()
  created_at: string;
}


export class DeleteLayerQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  layerTypeId?: number;
}