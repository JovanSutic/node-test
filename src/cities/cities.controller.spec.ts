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
      city_social_lifestyle_report: { findMany: jest.fn() },
      prices: { groupBy: jest.fn() },
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
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
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
    expect(response.body.lat).toBe(44.12345);
    expect(response.body.lng).toBe(24.1234);
    expect(response.body.seaside).toBe(false);
  });

  it("should not create duplicate via POST /cities", async () => {
    const createCityDto = {
      name: "Belgrade",
      country: "Serbia",
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
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
      {
        id: 1,
        name: "Belgrade",
        country: "Serbia",
        search: "Belgrade",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
      {
        id: 2,
        name: "Novi Sad",
        country: "Serbia",
        search: "Novi-Sad",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
    ];
    jest.spyOn(citiesService, "getAll").mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/cities")
      .expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return city cards via GET /cities/cards with filters", async () => {
    // Step 1: Mock all Prisma calls used in getAllCards
    prismaServiceMock.def_value = {
      findMany: jest
        .fn()
        .mockResolvedValue([{ countryId: 1 }, { countryId: 2 }]),
    };

    prismaServiceMock.cities = {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: "Belgrade",
          country: "Serbia",
          search: "Belgrade",
          lat: 44.1,
          lng: 20.1,
          seaside: false,
          size: 1000000,
          countryId: 1,
          layers: [{ value: 1500 }],
        },
      ]),
      count: jest.fn().mockResolvedValue(1),
    };

    prismaServiceMock.crime_ranks = {
      findMany: jest.fn().mockResolvedValue([
        {
          cityId: 1,
          crimeAspectId: 1,
          value: 0.3,
        },
      ]),
    };

    // Step 2: Call the actual endpoint
    const response = await request(app.getHttpServer())
      .get("/cities/cards")
      .query({
        north: 55,
        south: 25,
        east: 30,
        west: -10,
        size: 1000000,
        offset: 0,
      })
      .expect(200);

    // Step 3: Assert response
    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          id: 1,
          name: "Belgrade",
          costOfLiving: 1500,
          safetyRating: expect.any(Object),
        }),
      ],
      total: 1,
      limit: 30,
      offset: 0,
      hasMore: false,
    });

    // Step 4: Assert Prisma calls were made correctly
    expect(prismaServiceMock.cities.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          lat: { gte: 25, lte: 55 },
          lng: { gte: -10, lte: 30 },
          size: { lte: 1000000 },
          countriesId: { in: [1, 2] },
        }),
      })
    );
  });

  it("should return cities with less than 55 CURRENT prices for yearId 16 via GET /cities/missing-prices", async () => {
    const mockCities: CityDto[] = [
      {
        id: 1,
        name: "Belgrade",
        country: "Serbia",
        search: "Belgrade",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
      {
        id: 2,
        name: "Novi Sad",
        country: "Serbia",
        search: "Novi-Sad",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
    ];

    jest
      .spyOn(citiesService, "getCitiesWithMissingPrices")
      .mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/cities/missing-prices")
      .query({
        priceType: "CURRENT",
        yearId: "16",
        lessThan: "55",
      })
      .expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return cities missing social report of type SOLO via GET /cities/missing-social-report", async () => {
    const mockCities: CityDto[] = [
      {
        id: 1,
        name: "Belgrade",
        country: "Serbia",
        search: "Belgrade",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
      {
        id: 2,
        name: "Novi Sad",
        country: "Serbia",
        search: "Novi-Sad",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
    ];

    jest
      .spyOn(citiesService, "getCitiesWithoutSocialReportType")
      .mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/cities/missing-social-report")
      .query({ type: "SOLO" })
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
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
    };

    prismaServiceMock.cities.findUnique = jest.fn().mockResolvedValue(city);

    const response = await request(app.getHttpServer())
      .get(`/cities/${cityId}`)
      .expect(200);

    expect(response.body).toEqual(city);
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
    expect(response.body.lat).toBe(44.12345);
    expect(response.body.lng).toBe(24.1234);
    expect(response.body.seaside).toBe(false);
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
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
    };
    const mockUpdatedCity = [
      {
        id: cityId,
        name: "Novi Sad",
        country: "Serbia",
        search: "Novi-Sad",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
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
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
    };
    const mockUpdatedCity = [
      {
        id: cityId,
        name: "Novi Sad",
        country: "Serbia",
        search: "Novi-Sad",
        lat: 44.12345,
        lng: 24.1234,
        seaside: false,
      },
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
      search: "Belgrade",
      lat: 44.12345,
      lng: 24.1234,
      seaside: false,
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: cityId });

    jest.spyOn(citiesService, "delete").mockResolvedValue(mockDeletedCity);

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
