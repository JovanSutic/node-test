// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { CitiesController } from "./cities.controller";
import { CitiesService } from "./cities.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto } from "./cities.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("CitiesController", () => {
  let app: INestApplication;
  let citiesService: CitiesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn(), findFirst: jest.fn() },
      products: { findUnique: jest.fn(), findFirst: jest.fn() },
      years: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [CitiesService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    citiesService = module.get<CitiesService>(CitiesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new city via POST /cities", async () => {
    const createCityDto = {
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };

    jest.spyOn(citiesService, "create").mockResolvedValue({
      id: 1,
      ...createCityDto,
    });

    prismaServiceMock.cities.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/cities")
      .send(createCityDto)
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), ...createCityDto });
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
    expect(response.body.numbeo_id).toBe(12345);
  });

  it("should not create duplicate via POST /cities", async () => {
    const createCityDto = {
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };

    prismaServiceMock.cities.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createCityDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/cities")
      .send(createCityDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "City with this name and country already exists",
      statusCode: 409,
    });
  });

  it("should return an array of cities via GET /cities", async () => {
    const mockCities: CityDto[] = [
      { id: 1, name: "Belgrade", country: "Serbia", numbeo_id: 12345 },
      { id: 2, name: "Novi Sad", country: "Serbia", numbeo_id: 12346 },
    ];
    jest.spyOn(citiesService, "getAll").mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/cities")
      .expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return a city by ID via GET /cities/:id", async () => {
    const cityId = 1;
    const city = {
      id: cityId,
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };

    prismaServiceMock.cities.findUnique = jest.fn().mockResolvedValue(city);

    const response = await request(app.getHttpServer())
      .get(`/cities/${cityId}`)
      .expect(200);

    expect(response.body).toEqual(city);
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
    expect(response.body.numbeo_id).toBe(12345);
  });

  it("should return 404 if city not found via GET /cities/:id", async () => {
    prismaServiceMock.cities.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/cities/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "City with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a city via PUT object /cities/", async () => {
    const cityId = 1;
    const mockExistingCity = {
      id: cityId,
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };
    const mockUpdatedCity = [
      { id: cityId, name: "Novi Sad", country: "Serbia", numbeo_id: 11111 },
    ];

    jest
      .spyOn(citiesService, "updateSingle")
      .mockResolvedValue(mockUpdatedCity);
    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingCity);

    const response = await request(app.getHttpServer())
      .put(`/cities/`)
      .send(mockUpdatedCity)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedCity);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /cities/", async () => {
    const cityId = 1;
    const mockExistingCity = {
      id: cityId,
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };
    const mockUpdatedCity = [
      { id: cityId, name: "Novi Sad", country: "Serbia", numbeo_id: 11111 },
    ];

    prismaServiceMock.cities.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/cities/`)
      .send(mockUpdatedCity)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "City with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a city by ID via DELETE /cities/:id", async () => {
    const cityId = 1;
    const mockDeletedCity = {
      id: cityId,
      name: "Belgrade",
      country: "Serbia",
      numbeo_id: 12345,
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: cityId });

    jest.spyOn(citiesService, "delete").mockResolvedValue(mockDeletedCity);
    jest.spyOn(citiesService, "getById").mockResolvedValue(mockDeletedCity);

    const response = await request(app.getHttpServer())
      .delete(`/cities/${cityId}`)
      .expect(200);

    expect(response.body).toEqual(mockDeletedCity);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via DELETE /cities/:id", async () => {
    const cityId = 1;
    prismaServiceMock.cities.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .delete(`/cities/${cityId}`)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "City with ID 1 not found",
      statusCode: 404,
    });
  });
});
