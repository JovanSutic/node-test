// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ProductDto } from "./products.dto";

describe("ProductsController", () => {
  let app: INestApplication;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    productsService = module.get<ProductsService>(ProductsService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new product via POST /products", async () => {
    const createProductDto = {
      name: "Man business shoes",
      category: "clothing and shoes",
      unit: "1 pair",
      description: "just text",
    };

    jest.spyOn(productsService, "create").mockResolvedValue({
      id: 1,
      ...createProductDto,
    });

    jest.spyOn(productsService, "getByName").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createProductDto,
    });
    expect(response.body.name).toBe("Man business shoes");
    expect(response.body.category).toBe("clothing and shoes");
    expect(response.body.unit).toBe("1 pair");
    expect(response.body.description).toBe("just text");
  });

  it("should return an array of products", async () => {
    const mockProducts: ProductDto[] = [
      {
        id: 1,
        name: "Man business shoes",
        category: "clothing and shoes",
        unit: "1 pair",
        description: "just text",
      },
      {
        id: 2,
        name: "Cinema ticket",
        category: "sport and leisure",
        unit: "1",
        description: "just text 1",
      },
    ];
    jest.spyOn(productsService, "getAll").mockResolvedValue(mockProducts);

    const response = await request(app.getHttpServer())
      .get("/products")
      .expect(200);

    expect(response.body).toEqual(mockProducts);
    expect(response.status).toBe(200);
  });

  it("should return a product by ID via GET /products/:id", async () => {
    const product = {
      id: 1,
      name: "Man business shoes",
      category: "clothing and shoes",
      unit: "1 pair",
      description: "just text",
    };

    jest.spyOn(productsService, "getById").mockResolvedValue(product);

    const response = await request(app.getHttpServer())
      .get("/products/1")
      .expect(200);

    expect(response.body).toEqual(product);
    expect(response.body.name).toBe("Man business shoes");
    expect(response.body.category).toBe("clothing and shoes");
    expect(response.body.unit).toBe("1 pair");
    expect(response.body.description).toBe("just text");
  });

  it("should return 404 if product not found via GET /products/:id", async () => {
    jest.spyOn(productsService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/products/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Product with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a product by the PUT object /products/", async () => {
    const productId = 1;
    const mockExistingProduct = {
      id: productId,
      name: "Man business shoes",
      category: "clothing and shoes",
      unit: "1 pair",
      description: "just text",
    };
    const mockUpdatedProduct = [
      {
        id: productId,
        name: "Man business shoes",
        category: "clothing and shoes",
        unit: "1 pair",
        description: "just text and something added",
      },
    ];

    jest
      .spyOn(productsService, "updateSingle")
      .mockResolvedValue(mockUpdatedProduct);
    jest
      .spyOn(productsService, "getById")
      .mockResolvedValue(mockExistingProduct);

    const response = await request(app.getHttpServer())
      .put(`/products/`)
      .send(mockUpdatedProduct)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedProduct);
    expect(response.status).toBe(200);
  });

  it("should delete a city by ID via DELETE /products/:id", async () => {
    const productId = 1;
    const mockDeletedProduct = {
      id: productId,
      name: "Man business shoes",
      category: "clothing and shoes",
      unit: "1 pair",
      description: "just text",
    };

    jest.spyOn(productsService, "delete").mockResolvedValue(mockDeletedProduct);
    jest
      .spyOn(productsService, "getById")
      .mockResolvedValue(mockDeletedProduct);

    const response = await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .expect(200);

    expect(response.body).toEqual(mockDeletedProduct);
    expect(response.status).toBe(200);
  });
});
