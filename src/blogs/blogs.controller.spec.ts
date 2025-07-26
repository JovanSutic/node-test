// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { BlogsController } from "./blogs.controller";
import { BlogService } from "./blogs.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BlogDto } from "./blogs.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("BlogsController", () => {
  let app: INestApplication;
  let blogService: BlogService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      blogs: { findUnique: jest.fn(), findFirst: jest.fn(), getBlogBySlug: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [BlogService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    blogService = module.get<BlogService>(BlogService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new blogs via POST /blogs", async () => {
    const createBlogDto = {
      cityId: null,
      countryId: 1,
      slug: "test-test-test",
      field: "tax",
      keywords: "test, tax",
      title: "Testing 123",
      description: "test for the test",
      visible: true,
    };

    jest.spyOn(blogService, "createBlog").mockResolvedValue({
      id: 1,
      ...createBlogDto,
    });

    prismaServiceMock.blogs.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/blogs")
      .send(createBlogDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createBlogDto,
    });
    expect(response.body.slug).toBe("test-test-test");
  });

  it("should not create duplicate via POST /blogs", async () => {
    const createBlogDto = {
      cityId: null,
      countryId: 1,
      slug: "test-test-test",
      field: "tax",
      keywords: "test, tax",
      title: "Testing 123",
      description: "test for the test",
      visible: true,
    };

    prismaServiceMock.blogs.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createBlogDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/blogs")
      .send(createBlogDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Blog with this name already exists",
      statusCode: 409,
    });
  });

  it("should return a blog by slug via GET /blogs/:slug", async () => {
    const blog = {
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
    };

    prismaServiceMock.blogs.findFirst = jest.fn().mockResolvedValue(blog);

    const response = await request(app.getHttpServer())
      .get("/blogs/slug/test-test-test")
      .expect(200);

    expect(response.body).toEqual(blog);
    expect(response.body.slug).toBe("test-test-test");
  });

  it("should return 404 if blogs not found via GET /blogs/:slug", async () => {
    prismaServiceMock.blogs.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/blogs/slug/blala-blabla")
      .expect(404);

    expect(response.body).toEqual({
      message: "Blog with slug blala-blabla not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a blogs via PUT object /blogs/", async () => {
    const blogId = 1;
    const mockExistingBlog = {
      id: blogId,
      cityId: null,
      countryId: 1,
      slug: "test-test-test",
      field: "tax",
      keywords: "test, tax",
      title: "Testing 123",
      description: "test for the test",
      visible: true,
      created_at: "2025-07-18T13:53:28.705Z",
    };
    const mockUpdatedBlog = [
      {
        id: blogId,
        cityId: null,
        countryId: 1,
        slug: "test-test",
        field: "tax",
        keywords: "test, tax",
        title: "Testing 123",
        description: "test for the test",
        visible: true,
        created_at: "2025-07-18T13:53:28.705Z",
      },
    ];

    jest.spyOn(blogService, "updateBlog").mockResolvedValue(mockUpdatedBlog);
    prismaServiceMock.blogs.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingBlog);

    const response = await request(app.getHttpServer())
      .put(`/blogs/`)
      .send(mockUpdatedBlog)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedBlog);
    expect(response.status).toBe(200);
  });

  it("should delete a blogs by ID via DELETE /blogs/:id", async () => {
    const blogId = 1;
    const mockDeletedAspect = {
      id: blogId,
      name: "insurance",
      field: "healthcare",
    };

    jest.spyOn(blogService, "deleteBlog").mockResolvedValue(mockDeletedAspect);

    prismaServiceMock.blogs.findUnique = jest
      .fn()
      .mockResolvedValue({ id: blogId });

    const response = await request(app.getHttpServer()).delete(
      `/blogs/${blogId}`
    );


    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedAspect.id);
    expect(response.body.name).toEqual(mockDeletedAspect.name);
  });

  it("should register unknown ID via DELETE /blogs/:id", async () => {
    const blogId = 1;
    prismaServiceMock.blogs.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/blogs/${blogId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Blog with slug 1 not found",
      statusCode: 404,
    });
  });
});
