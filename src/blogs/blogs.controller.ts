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
import {
  ExistenceValidationPipe,
  ForeignKeyValidationPipe,
  UniqueExistenceValidation,
  ValidationPipe,
} from "./blogs.validation.pipe";

@Controller("blogs")
@ApiTags("blogs")
export class BlogsController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ExistenceValidationPipe)
  @ApiOperation({ summary: "Create a new blog post" })
  @ApiBody({
    description: "The data to create new blog",
    type: CreateBlogDto,
    examples: {
      single: {
        value: {
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successfully created a blog",
    type: BlogDto,
    examples: {
      single: {
        summary: "Blogs DTO",
        value: {
          id: 1,
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
          created_at: "2025-07-18T13:53:28.705Z",
        },
      },
    },
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
    status: 201,
    description: "Filtered list of blogs",
    type: BlogDto,
    examples: {
      single: {
        summary: "Blog DTO",
        value: [
          {
            id: 1,
            cityId: null,
            countryId: 1,
            slug: "test-test-test",
            field: "tax",
            keywords: "test, tax",
            title: "Testing 123",
            description: "test for the test",
            visible: true,
            created_at: "2025-07-18T13:53:28.705Z",
          },
        ],
      },
    },
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
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Get single blog by slug (with sections)" })
  @ApiResponse({
    status: 201,
    description: "Single blog with sections",
    type: BlogDto,
    examples: {
      single: {
        summary: "Blog DTO",
        value: {
          id: 1,
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
          created_at: "2025-07-18T13:53:28.705Z",
        },
      },
    },
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
  @ApiBody({
    description: "The data to update blog",
    type: CreateBlogDto,
    examples: {
      single: {
        value: {
          id: 1,
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
          created_at: "2025-07-18T13:53:28.705Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successfully updated the blog",
    type: BlogDto,
    examples: {
      single: {
        summary: "Blogs DTO",
        value: {
          id: 1,
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
          created_at: "2025-07-18T13:53:28.705Z",
        },
      },
    },
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
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete blog by ID" })
  @ApiResponse({
    status: 201,
    description: "Successfully deleted the blog",
    type: BlogDto,
    examples: {
      single: {
        summary: "Blogs DTO",
        value: {
          id: 1,
          cityId: null,
          countryId: 1,
          slug: "test-test-test",
          field: "tax",
          keywords: "test, tax",
          title: "Testing 123",
          description: "test for the test",
          visible: true,
          created_at: "2025-07-18T13:53:28.705Z",
        },
      },
    },
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
  @UsePipes(ValidationPipe, ForeignKeyValidationPipe)
  @ApiOperation({ summary: "Create one or more blog sections" })
  @ApiBody({
    description: "Blog sections body",
    type: CreateBlogSectionDto,
    examples: {
      multiple: {
        value: [
          {
            blogId: 1,
            order: 1,
            type: "text",
            content:
              "Italy Digital Nomad Visa 2025: Full Tax Breakdown for Freelancers",
            note: null,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Successfully created blog sections",
    type: CreateBlogSectionDto,
    examples: {
      single: {
        summary: "BlogSection DTO",
        value: {
          count: 1,
        },
      },
    },
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
    example: {
      value: {
        id: 1,
        blogId: 1,
        order: 1,
        type: "text",
        content:
          "Italy Digital Nomad Visa 2025: Full Tax Breakdown for Freelancers",
        note: null,
        created_at: "2025-07-18T13:54:03.089Z",
      },
    },
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
    type: CreateBlogSectionDto,
    example: {
      value: {
        id: 1,
        blogId: 1,
        order: 1,
        type: "text",
        content:
          "Italy Digital Nomad Visa 2025: Full Tax Breakdown for Freelancers",
        note: null,
        created_at: "2025-07-18T13:54:03.089Z",
      },
    },
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
