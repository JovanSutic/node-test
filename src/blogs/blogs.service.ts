import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBlogDto, BlogDto, CreateBlogSectionDto } from "./blogs.dto";

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async createBlog(data: CreateBlogDto) {
    try {
      return await this.prisma.blogs.create({
        data,
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error while creating blog"
      );
    }
  }

  async getAllBlogsFiltered(field?: string, countryId?: number) {
    try {
      return await this.prisma.blogs.findMany({
        where: {
          ...(field ? { field } : {}),
          ...(countryId ? { countryId } : {}),
        },
        orderBy: {
          created_at: "desc",
        },
        include: {
          blog_sections: true,
        },
      });
    } catch (error: any) {
      throw new Error(error.message || "Error fetching filtered blogs.");
    }
  }

  async getBlogById(id: number) {
    try {
      return await this.prisma.blogs.findUnique({
        where: { id },
        include: {
          blog_sections: true,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while fetching blog with ID ${id}`
      );
    }
  }

  async getBlogBySlug(slug: string) {
    try {
      return await this.prisma.blogs.findFirst({
        where: { slug },
        include: {
          blog_sections: {
            orderBy: { order: "asc" },
          },
        },
      });
    } catch (error: any) {
      throw new Error(
        error.message || `Error fetching blog with slug: ${slug}`
      );
    }
  }

  async updateBlog(data: Partial<BlogDto>) {
    try {
      return await this.prisma.blogs.update({
        where: { id: data.id },
        data,
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while updating blog with ID ${data.id}`
      );
    }
  }

  async deleteBlog(id: number) {
    try {
      return await this.prisma.blogs.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while deleting blog with ID ${id}`
      );
    }
  }

  async createBlogSection(data: CreateBlogSectionDto | CreateBlogSectionDto[]) {
    try {
      if (Array.isArray(data)) {
        return await this.prisma.blog_sections.createMany({
          data,
        });
      } else {
        return await this.prisma.blog_sections.create({
          data,
        });
      }
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "Error while creating blog section(s)"
      );
    }
  }

  async getBlogSectionById(id: number) {
    try {
      return await this.prisma.blog_sections.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while fetching blog section with ID ${id}`
      );
    }
  }

  async deleteBlogSection(id: number) {
    try {
      return await this.prisma.blog_sections.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message || `Error while deleting blog section with ID ${id}`
      );
    }
  }
}
