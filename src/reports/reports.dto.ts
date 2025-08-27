import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  IsArray,
  IsIn,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { SocialType } from "../social_lifestyle/social_lifestyle.dto";
import type { currencyString } from "../types/flow.types";

export class CreateReportDto {
  @ApiProperty({ description: "Cognito UUID of the user", type: String })
  @IsString()
  userUuid: string;

  @ApiProperty({ description: "City ID", type: Number })
  @IsNumber()
  cityId: number;

  @ApiProperty({ description: "Net amount", type: Number })
  @IsNumber()
  net: number;

  @ApiProperty({ description: "Save amount", type: Number })
  @IsNumber()
  save: number;

  @ApiProperty({ description: "Low level living expenses", type: Number })
  @IsNumber()
  expensesLow: number;

  @ApiProperty({ description: "Comfort level living expenses", type: Number })
  @IsNumber()
  expensesComfort: number;

  @ApiProperty({
    description: "Type of report",
    enum: SocialType,
  })
  @IsString()
  @IsEnum(SocialType)
  type: SocialType;

  @ApiProperty({ description: "User data JSON", type: Object })
  @IsObject()
  userData: Record<string, any>;
}

export class ReportDto extends CreateReportDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  createdAt: string;
}

export class CreateReportItemDto {
  @ApiProperty({ description: "ID of the report", type: Number })
  @IsNumber()
  reportId: number;

  @ApiProperty({
    description: "Income maker identifier (e.g., 1 or 2)",
    type: Number,
  })
  @IsNumber()
  incomeMaker: number;

  @ApiProperty({ description: "Label of the cost item", type: String })
  @IsString()
  label: string;

  @ApiProperty({
    description: "Type of cost (e.g., tax, accounting)",
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({ description: "Amount of cost", type: Number })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "Additional JSON data",
    type: Object,
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ReportCostItemDto extends CreateReportItemDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  createdAt: string;
}

export class PublicReportDto extends OmitType(CreateReportDto, [
  "userUuid",
] as const) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportCostItemDto)
  costItems: ReportCostItemDto[];
}

export class PersonalIncomesDto {
  @IsBoolean()
  isUSCitizen: boolean;

  @IsIn(["usd", "eur", "gbp"])
  currency: currencyString;

  @IsNumber()
  income: number;

  @IsNumber()
  accountantCost: number;

  @IsNumber()
  expensesCost: number;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsString()
  @IsOptional()
  workType?: string;

  @IsBoolean()
  @IsOptional()
  isSpecialist?: boolean;
}

export class DependentsDto {
  @IsIn(["spouse", "kid"])
  type: "spouse" | "kid";

  @IsBoolean()
  isDependent: boolean;

  @IsOptional()
  @IsNumber()
  age?: number;
}

export class ReportUserDataDto {
  @IsNumber()
  cityId: number;

  @IsBoolean()
  isWorkingMom: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependentsDto)
  dependents: DependentsDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalIncomesDto)
  incomes: PersonalIncomesDto[];
}
