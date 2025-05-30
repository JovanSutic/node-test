// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { WeathersController } from "./weathers.controller";
import { WeathersService } from "./weathers.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import request from "supertest";

const mockWeathers = [
  {
    id: 1,
    cityId: 1,
    sunshine: 250,
    rain: 100,
    cold: 60,
    heat: 90,
    cold_extremes: 5,
    heat_extremes: 3,
    humidity: 75,
    severe: "Low risk of storms",
    lowest: -10,
    highest: 35,
    created_at: new Date().toISOString(),
  },
];

describe("WeathersController", () => {
  let app: INestApplication;
  let weathersService: WeathersService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn() },
      weathers: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeathersController],
      providers: [WeathersService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = module.createNestApplication();
    weathersService = module.get<WeathersService>(WeathersService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create weather records - POST /weathers", async () => {
    const data = {
      cityId: 1,
      sunshine: 250,
      rain: 100,
      cold: 60,
      heat: 90,
      cold_extremes: 5,
      heat_extremes: 3,
      humidity: 75,
      severe: "Low risk of storms",
      lowest: -10,
      highest: 35,
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.weathers.findUnique = jest.fn().mockResolvedValue(null);

    jest.spyOn(weathersService, "create").mockResolvedValue([data]);

    const response = await request(app.getHttpServer())
      .post("/weathers")
      .send([data])
      .expect(201);

    expect(response.body).toEqual([data]);
  });

  it("should update weather records - PUT /weathers", async () => {
    const data = [
      {
        id: 1,
        cityId: 1,
        sunshine: 250,
        rain: 100,
        cold: 60,
        heat: 90,
        cold_extremes: 5,
        heat_extremes: 3,
        humidity: 75,
        severe: "Low risk of storms",
        lowest: -10,
        highest: 35,
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.weathers.findUnique = jest
      .fn()
      .mockResolvedValue(data[0]);

    jest.spyOn(weathersService, "update").mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .put("/weathers")
      .send(data)
      .expect(200);

    expect(response.body).toEqual(data);
  });

  it("should fetch all weather records - GET /weathers", async () => {
    jest.spyOn(weathersService, "getAll").mockResolvedValue(mockWeathers);

    const response = await request(app.getHttpServer())
      .get("/weathers")
      .expect(200);

    expect(response.body).toEqual(mockWeathers);
  });

  it("should filter weather records by country - GET /weathers?country=Serbia", async () => {
    jest.spyOn(weathersService, "getAll").mockResolvedValue(mockWeathers);

    const response = await request(app.getHttpServer())
      .get("/weathers")
      .query({ country: "Serbia" })
      .expect(200);

    expect(response.body).toEqual(mockWeathers);
  });
});
