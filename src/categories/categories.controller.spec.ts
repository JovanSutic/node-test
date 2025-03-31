// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CategoryDto } from "./categories.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("CategoriesController", () => {
  let app: INestApplication;
  let categoriesService: CategoriesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      categories: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoriesService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    categoriesService = module.get<CategoriesService>(CategoriesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new category via POST /categories", async () => {
    const createCategoryDto = {
      name: "Markets",
    };

    jest.spyOn(categoriesService, "create").mockResolvedValue({
      id: 1,
      ...createCategoryDto,
    });

    prismaServiceMock.categories.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/categories")
      .send(createCategoryDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createCategoryDto,
    });
    expect(response.body.name).toBe("Markets");
  });

  it("should not create duplicate via POST /categories", async () => {
    const createCategoryDto = {
      name: "Markets",
    };

    prismaServiceMock.categories.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createCategoryDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/categories")
      .send(createCategoryDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Category with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of categories via GET /categories", async () => {
    const mockCities: CategoryDto[] = [
      { id: 1, name: "Markets" },
      { id: 2, name: "Restaurants" },
    ];
    jest.spyOn(categoriesService, "getAll").mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/categories")
      .expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return a category by ID via GET /categories/:id", async () => {
    const category = {
      id: 1,
      name: "Markets",
    };

    prismaServiceMock.categories.findUnique = jest
      .fn()
      .mockResolvedValue(category);

    const response = await request(app.getHttpServer())
      .get("/categories/1")
      .expect(200);

    expect(response.body).toEqual(category);
    expect(response.body.name).toBe("Markets");
  });

  it("should return 404 if category not found via GET /categories/:id", async () => {
    prismaServiceMock.categories.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/categories/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Category with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a category via PUT object /categories/", async () => {
    const categoryId = 1;
    const mockExistingCategory = {
      id: categoryId,
      name: "Markets",
    };
    const mockUpdatedCategory = [{ id: categoryId, name: "Restaurants" }];

    jest
      .spyOn(categoriesService, "updateSingle")
      .mockResolvedValue(mockUpdatedCategory);
    prismaServiceMock.categories.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingCategory);

    const response = await request(app.getHttpServer())
      .put(`/categories/`)
      .send(mockUpdatedCategory)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedCategory);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /categories/", async () => {
    const categoryId = 1;
    const mockExistingCategory = {
      id: categoryId,
      name: "Markets",
    };
    const mockUpdatedCategory = [{ id: categoryId, name: "Restaurants" }];

    prismaServiceMock.categories.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/categories/`)
      .send(mockUpdatedCategory)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Category with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a category by ID via DELETE /categories/:id", async () => {
    const categoryId = 1;
    const mockDeletedCategory = {
      id: categoryId,
      name: "Markets",
    };

    jest
      .spyOn(categoriesService, "delete")
      .mockResolvedValue(mockDeletedCategory);
      
    prismaServiceMock.categories.findUnique = jest
      .fn()
      .mockResolvedValue({ id: categoryId });

    const response = await request(app.getHttpServer()).delete(
      `/categories/${categoryId}`
    );

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedCategory.id);
    expect(response.body.name).toEqual(mockDeletedCategory.name);
  });

  it("should register unknown ID via DELETE /categories/:id", async () => {
    const categoryId = 1;
    prismaServiceMock.categories.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/categories/${categoryId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Category with ID 1 not found",
      statusCode: 404,
    });
  });
});
