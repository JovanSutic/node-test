// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { CountriesController } from "./countries.controller";
import { CountriesService } from "./countries.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CountryDto } from "./countries.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("CountriesController", () => {
  let app: INestApplication;
  let countriesService: CountriesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      countries: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [CountriesService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    countriesService = module.get<CountriesService>(CountriesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new country via POST /countries", async () => {
    const createCountryDto = {
      name: "Italy",
    };

    jest.spyOn(countriesService, "create").mockResolvedValue({
      id: 1,
      ...createCountryDto,
    });

    prismaServiceMock.countries.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/countries")
      .send(createCountryDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createCountryDto,
    });
    expect(response.body.name).toBe("Italy");
  });

  it("should not create duplicate via POST /countries", async () => {
    const createCountryDto = {
      name: "Italy",
    };

    prismaServiceMock.countries.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createCountryDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/countries")
      .send(createCountryDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Country with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of countries via GET /countries", async () => {
    const mockCities: CountryDto[] = [
      { id: 1, name: "Italy" },
      { id: 2, name: "Spain" },
    ];
    jest.spyOn(countriesService, "getAll").mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/countries")
      .expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return a country by ID via GET /countries/:id", async () => {
    const country = {
      id: 1,
      name: "Italy",
    };

    prismaServiceMock.countries.findUnique = jest
      .fn()
      .mockResolvedValue(country);

    const response = await request(app.getHttpServer())
      .get("/countries/1")
      .expect(200);

    expect(response.body).toEqual(country);
    expect(response.body.name).toBe("Italy");
  });

  it("should return 404 if country not found via GET /countries/:id", async () => {
    prismaServiceMock.countries.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/countries/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Country with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a country via PUT object /countries/", async () => {
    const countryId = 1;
    const mockExistingCountry = {
      id: countryId,
      name: "Italy",
    };
    const mockUpdatedCountry = [{ id: countryId, name: "Spain" }];

    jest
      .spyOn(countriesService, "updateMany")
      .mockResolvedValue(mockUpdatedCountry);
    prismaServiceMock.countries.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingCountry);

    const response = await request(app.getHttpServer())
      .put(`/countries/`)
      .send(mockUpdatedCountry)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedCountry);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /countries/", async () => {
    const countryId = 1;
    const mockExistingCountry = {
      id: countryId,
      name: "Italy",
    };
    const mockUpdatedCountry = [{ id: countryId, name: "Spain" }];

    prismaServiceMock.countries.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/countries/`)
      .send(mockUpdatedCountry)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Country with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a country by ID via DELETE /countries/:id", async () => {
    const countryId = 1;
    const mockDeletedCountry = {
      id: countryId,
      name: "Italy",
    };

    jest
      .spyOn(countriesService, "delete")
      .mockResolvedValue(mockDeletedCountry);

    prismaServiceMock.countries.findUnique = jest
      .fn()
      .mockResolvedValue({ id: countryId });

    const response = await request(app.getHttpServer()).delete(
      `/countries/${countryId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedCountry.id);
    expect(response.body.name).toEqual(mockDeletedCountry.name);
  });

  it("should register unknown ID via DELETE /countries/:id", async () => {
    const countryId = 1;
    prismaServiceMock.countries.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/countries/${countryId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Country with ID 1 not found",
      statusCode: 404,
    });
  });
});
