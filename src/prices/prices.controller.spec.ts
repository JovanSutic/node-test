// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { PricesController } from "./prices.controller";
import { PricesService } from "./prices.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PriceDto } from "./prices.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("PricesController", () => {
  let app: INestApplication;
  let pricesService: PricesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn() },
      products: { findUnique: jest.fn() },
      years: { findUnique: jest.fn() },
      prices: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricesController],
      providers: [PricesService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    pricesService = module.get<PricesService>(PricesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new price via POST /prices", async () => {
    const createPriceDto = {
      price: 0.52,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.products.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });

    prismaServiceMock.prices.findFirst = jest.fn().mockResolvedValue(null);

    jest.spyOn(pricesService, "create").mockResolvedValue({
      id: 1,
      ...createPriceDto,
    });

    const response = await request(app.getHttpServer())
      .post("/prices")
      .send(createPriceDto)
      .expect(201);

    expect(response.body.price).toBe(0.52);
    expect(response.body.currency).toBe("EUR");
    expect(response.body.cityId).toBe(1);
    expect(response.body.productId).toBe(1);
    expect(response.body.yearId).toBe(1);
    expect(response.body.priceType).toBe("HISTORICAL");
  });

  it("should not create duplicates via POST /prices", async () => {
    const createPriceDto = {
      price: 0.52,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.products.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });

    prismaServiceMock.prices.findFirst = jest.fn().mockResolvedValue({
      id: 1,
      price: 0.52,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
    });

    const response = await request(app.getHttpServer())
      .post("/prices")
      .send(createPriceDto);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Price with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of prices via GET /prices", async () => {
    const mockPrices: PriceDto[] = [
      {
        id: 1,
        price: 300,
        currency: "EUR",
        cityId: 1,
        productId: 1,
        yearId: 1,
        priceType: "HISTORICAL",
        createdAt: "2025-03-26T19:50:30.809Z",
        updatedAt: "2025-03-26T19:50:30.809Z",
      },
      {
        id: 2,
        price: 200,
        currency: "EUR",
        cityId: 2,
        productId: 1,
        yearId: 1,
        priceType: "HISTORICAL",
        createdAt: "2025-03-26T19:50:30.809Z",
        updatedAt: "2025-03-26T19:50:30.809Z",
      },
    ];

    const mockPaginatedResult = {
      data: mockPrices,
      total: 2,
      limit: 10,
      offset: 0,
    };

    const spy = jest
      .spyOn(pricesService, "getAll")
      .mockResolvedValue(mockPaginatedResult);

    const response = await request(app.getHttpServer())
      .get("/prices")
      .query({ limit: "10", offset: "0" })
      .expect(200);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ limit: "10", offset: "0" })
    );

    expect(response.body).toEqual(mockPaginatedResult);
    expect(response.status).toBe(200);
  });

  it("should return a price by ID via GET /prices/:id", async () => {
    const price = {
      id: 1,
      price: 300,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
      createdAt: "2025-03-26T19:50:30.809Z",
      updatedAt: "2025-03-26T19:50:30.809Z",
    };

    prismaServiceMock.prices.findUnique = jest.fn().mockResolvedValue(price);

    jest.spyOn(pricesService, "getById").mockResolvedValue(price);

    const response = await request(app.getHttpServer())
      .get("/prices/1")
      .expect(200);

    expect(response.body).toEqual(price);
    expect(response.body.price).toBe(300);
    expect(response.body.currency).toBe("EUR");
    expect(response.body.cityId).toBe(1);
    expect(response.body.productId).toBe(1);
    expect(response.body.yearId).toBe(1);
    expect(response.body.priceType).toBe("HISTORICAL");
  });

  it("should return 404 if price not found via GET /prices/:id", async () => {
    prismaServiceMock.prices.findUnique = jest.fn().mockResolvedValue(null);
    jest.spyOn(pricesService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/prices/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Price with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a price via PUT object /prices/", async () => {
    const priceId = 1;
    const mockExistingPrice = {
      id: priceId,
      price: 300,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
    };
    const mockUpdatedPrice = [
      {
        id: priceId,
        price: 200,
        currency: "EUR",
        cityId: 1,
        productId: 1,
        yearId: 1,
        priceType: "HISTORICAL",
        createdAt: "2025-03-26T19:50:30.809Z",
        updatedAt: "2025-03-26T19:50:30.809Z",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.products.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });

    prismaServiceMock.prices.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingPrice);

    jest
      .spyOn(pricesService, "updateSingle")
      .mockResolvedValue(mockUpdatedPrice);

    const response = await request(app.getHttpServer())
      .put(`/prices/`)
      .send(mockUpdatedPrice)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedPrice);
  });

  it("should register unknown ID via PUT object /prices/", async () => {
    const priceId = 1;
    const mockExistingPrice = {
      id: priceId,
      price: 300,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
    };
    const mockUpdatedPrice = [
      {
        id: priceId,
        price: 200,
        currency: "EUR",
        cityId: 1,
        productId: 1,
        yearId: 1,
        priceType: "HISTORICAL",
        createdAt: "2025-03-26T19:50:30.809Z",
        updatedAt: "2025-03-26T19:50:30.809Z",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.products.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });

    prismaServiceMock.prices.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/prices/`)
      .send(mockUpdatedPrice)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Price with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a price by ID via DELETE /prices/:id", async () => {
    const priceId = 1;
    const mockDeletedCity = {
      id: priceId,
      price: 300,
      currency: "EUR",
      cityId: 1,
      productId: 1,
      yearId: 1,
      priceType: "HISTORICAL",
      createdAt: "2025-03-26T19:50:30.809Z",
      updatedAt: "2025-03-26T19:50:30.809Z",
    };

    prismaServiceMock.prices.findUnique = jest
      .fn()
      .mockResolvedValue(mockDeletedCity);
    jest.spyOn(pricesService, "delete").mockResolvedValue(mockDeletedCity);

    const response = await request(app.getHttpServer())
      .delete(`/prices/${priceId}`)
      .expect(200);

    expect(response.body).toEqual(mockDeletedCity);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via DELETE /prices/:id", async () => {
    const priceId = 1;
    prismaServiceMock.prices.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .delete(`/prices/${priceId}`)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Price with ID 1 not found",
      statusCode: 404,
    });
  });
});
