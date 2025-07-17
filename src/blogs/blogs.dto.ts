import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsBoolean, IsDate } from "class-validator";

export class CreateBlogDto {
  @ApiProperty({ description: "City ID", required: false, type: Number })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiProperty({ description: "Country ID", required: false, type: Number })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  @ApiProperty({ description: "Unique slug for the blog", type: String })
  @IsString()
  slug: string;

  @ApiProperty({ description: "Field or topic of the blog", type: String })
  @IsString()
  field: string;

  @ApiProperty({ description: "Keywords related to the blog", type: String })
  @IsString()
  keywords: string;

  @ApiProperty({ description: "Title of the blog", type: String })
  @IsString()
  title: string;

  @ApiProperty({ description: "Short description of the blog", type: String })
  @IsString()
  description: string;

  @ApiProperty({ description: "Visibility status of the blog", type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}

export class BlogDto extends CreateBlogDto {
  @ApiProperty({ description: "Blog ID", type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ description: "Date of blog creation", type: Date })
  @IsDate()
  created_at: Date;
}

export class CreateBlogSectionDto {
  @ApiProperty({ description: "ID of the blog this section belongs to", type: Number })
  @IsNumber()
  blogId: number;

  @ApiProperty({ description: "Order of this section in the blog", type: Number })
  @IsNumber()
  order: number;

  @ApiProperty({ description: "Type of the section (text, image, quote, etc.)", type: String })
  @IsString()
  type: string;

  @ApiProperty({ description: "Content of the section", type: String })
  @IsString()
  content: string;

  @ApiProperty({ description: "Optional note for internal use or annotation", required: false, type: String })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BlogSectionDto extends CreateBlogSectionDto {
  @ApiProperty({ description: "Section ID", type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ description: "Date the section was created", type: Date })
  @IsDate()
  created_at: Date;
}