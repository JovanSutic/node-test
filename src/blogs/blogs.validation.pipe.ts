import { PrismaService } from "../prisma/prisma.service";
import { BlogDto, CreateBlogDto, CreateBlogSectionDto } from "./blogs.dto";
import {
  Injectable,
  type PipeTransform,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

const checkForeignKeys = async (
  section: CreateBlogSectionDto,
  prisma: PrismaService
) => {
  const { blogId } = section;

  try {
    const [blog] = await Promise.all([
      prisma.blogs.findUnique({ where: { id: blogId } }),
    ]);

    if (!blog) {
      throw new BadRequestException(`Blog with ID ${blogId} not found`);
    }
  } catch (error) {
    throw error;
  }
};

@Injectable()
export class ForeignKeyValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    if (Array.isArray(value)) {
      await Promise.all(
        value.map((item) => checkForeignKeys(item, this.prisma))
      );
    } else {
      await checkForeignKeys(value, this.prisma);
    }

    return value;
  }
}

const validateSection = (section: CreateBlogSectionDto) => {
  if (!section.blogId || isNaN(Number(section.blogId))) {
    throw new BadRequestException("Blog id must be defined");
  }
  if (!section.order || isNaN(Number(section.order))) {
    throw new BadRequestException("Order must be defined");
  }
  if (
    !section.type ||
    typeof section.type !== "string" ||
    section.type.length < 3
  ) {
    throw new BadRequestException(
      "Type must be a string with at least 3 characters"
    );
  }
  if (
    !section.content ||
    typeof section.content !== "string" ||
    section.content.length < 3
  ) {
    throw new BadRequestException(
      "Content must be a string with at least 3 characters"
    );
  }
};

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        for (const item of value) {
          validateSection(item);
        }
      } else {
        validateSection(value);
      }
    }

    return value;
  }
}

const checkAspectExistence = async (
  blog: BlogDto | CreateBlogDto,
  prisma: PrismaService
) => {
  try {
    let item = undefined;
    if ("id" in blog) {
      item = await prisma.blogs.findUnique({
        where: { id: Number(blog.id) },
      });
    } else {
      item = await prisma.blogs.findFirst({
        where: {
          slug: blog.slug,
        },
      });
    }

    if ("id" in blog) {
      if (!item) {
        throw new NotFoundException(`Blog with ID ${blog.id} not found`);
      }
    } else {
      if (item) {
        throw new ConflictException("Blog with this name already exists");
      }
    }
  } catch (error) {
    throw error;
  }
};

@Injectable()
export class ExistenceValidationPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any) {
    if (value && typeof value === "object") {
      try {
        if (Array.isArray(value)) {
          for (const item of value) {
            await checkAspectExistence(item, this.prisma);
          }
        } else {
          await checkAspectExistence(value, this.prisma);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}

@Injectable()
export class UniqueExistenceValidation implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}
  async transform(value: any) {
    if (value && typeof value !== "object") {
      try {
        let blog = null;
        if (Number.isNaN(Number(value))) {
          blog = await this.prisma.blogs.findFirst({
            where: { slug: value },
          });
        } else {
          blog = await this.prisma.blogs.findUnique({
            where: { id: Number(value) },
          });
        }

        if (!blog) {
          throw new NotFoundException(`Blog with slug ${value} not found`);
        }
      } catch (error) {
        throw error;
      }
    }
    return value;
  }
}
