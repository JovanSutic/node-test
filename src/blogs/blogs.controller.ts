import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  BadRequestException,
  NotFoundException,
  Delete,
} from "@nestjs/common";
import { BlogService } from "./blogs.service";
import { CreateBlogDto, BlogDto, CreateBlogSectionDto } from "./blogs.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("blogs")
@ApiTags("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create a new blog post" })
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({
    status: 201,
    description: "Blog created successfully",
    type: BlogDto,
  })
  async create(@Body() dto: CreateBlogDto) {
    try {
      return await this.blogService.createBlog(dto);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error while creating blog"
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: "Get all blogs (filtered by field and/or countryId)",
  })
  @ApiResponse({
    status: 200,
    description: "Filtered blogs list",
    type: [BlogDto],
  })
  async getAll(
    @Query("field") field?: string,
    @Query("countryId") countryId?: string
  ) {
    try {
      return await this.blogService.getAllBlogsFiltered(
        field,
        countryId ? Number(countryId) : undefined
      );
    } catch (error: any) {
      throw new BadRequestException(error.message || "Error fetching blogs");
    }
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get single blog by slug (with sections)" })
  @ApiResponse({
    status: 200,
    description: "Single blog with sections",
    type: BlogDto,
  })
  async getBySlug(@Param("slug") slug: string) {
    try {
      const blog = await this.blogService.getBlogBySlug(slug);
      if (!blog) {
        throw new NotFoundException(`No blog found for slug: ${slug}`);
      }

      return blog;
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error fetching blog by slug: ${slug}`
      );
    }
  }

  @Put()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Update an existing blog post" })
  @ApiBody({ type: BlogDto })
  @ApiResponse({
    status: 200,
    description: "Blog updated successfully",
    type: BlogDto,
  })
  async update(@Body() dto: BlogDto) {
    try {
      return await this.blogService.updateBlog(dto);
    } catch (error: any) {
      throw new BadRequestException(error.message || "Error updating the blog");
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete blog by ID" })
  @ApiResponse({
    status: 200,
    description: "Blog deleted successfully",
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.blogService.deleteBlog(Number(id));
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error deleting blog with ID: ${id}`
      );
    }
  }

  @Post("section")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Create one or more blog sections" })
  @ApiBody({ type: CreateBlogSectionDto, isArray: true })
  @ApiResponse({
    status: 201,
    description: "Section(s) created",
    type: CreateBlogSectionDto,
  })
  async createSection(
    @Body() dto: CreateBlogSectionDto | CreateBlogSectionDto[]
  ) {
    try {
      return await this.blogService.createBlogSection(dto);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error creating blog section(s)"
      );
    }
  }

  @Get("section/:id")
  @ApiOperation({ summary: "Get a single blog section by ID" })
  @ApiResponse({
    status: 200,
    description: "Single blog section",
    type: CreateBlogSectionDto,
  })
  async getSectionById(@Param("id") id: string) {
    try {
      return await this.blogService.getBlogSectionById(Number(id));
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error fetching blog section with ID ${id}`
      );
    }
  }

  @Delete("section/:id")
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Delete a blog section by ID" })
  @ApiResponse({
    status: 200,
    description: "Section deleted",
  })
  async deleteSection(@Param("id") id: string) {
    try {
      return await this.blogService.deleteBlogSection(Number(id));
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error deleting blog section with ID ${id}`
      );
    }
  }
}
