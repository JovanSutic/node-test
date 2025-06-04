// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { CityContextController } from "./city_context.controller";
import { CityContextService } from "./city_context.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import request from "supertest";

const mockCityContext = [
  {
    id: 1,
    cityId: 1,
    climate: "Mild",
    tourismLevel: "High",
    expatCommunity: "Large",
    natureAccess: "Excellent",
    localLifestyle: "Relaxed",
    seasonality: "Year-round",
    cultureHighlights: "Museums and festivals",
    sportsAndActivities: "Cycling, hiking",
    detailedStory: "A very vibrant and accessible city.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    city: {
      id: 1,
      name: "Belgrade",
      country: "Serbia",
      lat: 44.7866,
      lng: 20.4489,
    },
  },
];

describe("CityContextController", () => {
  let app: INestApplication;
  let cityContextService: CityContextService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn() },
      city_context: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityContextController],
      providers: [CityContextService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = module.createNestApplication();
    cityContextService = module.get<CityContextService>(CityContextService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create city context records - POST /city-context", async () => {
    const data = [
      {
        cityId: 1,
        climate: "Mild",
        tourismLevel: "High",
        expatCommunity: "Large",
        natureAccess: "Excellent",
        localLifestyle: "Relaxed",
        seasonality: "Year-round",
        cultureHighlights: "Museums and festivals",
        sportsAndActivities: "Cycling, hiking",
        detailedStory: "A very vibrant and accessible city.",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(cityContextService, "create").mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post("/city-context")
      .send(data)
      .expect(201);

    expect(response.body).toEqual(data);
  });

  it("should update city context records - PUT /city-context", async () => {
    const updateData = [
      {
        id: 1,
        cityId: 1,
        climate: "Updated",
        tourismLevel: "Medium",
        expatCommunity: "Growing",
        natureAccess: "Good",
        localLifestyle: "Busy",
        seasonality: "Winter-heavy",
        cultureHighlights: "Theater",
        sportsAndActivities: "Swimming",
        detailedStory: "Updated story",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.city_context.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(cityContextService, "updateMany").mockResolvedValue(updateData);

    const response = await request(app.getHttpServer())
      .put("/city-context")
      .send(updateData)
      .expect(200);

    expect(response.body).toEqual(updateData);
  });

  it("should fetch all city context records - GET /city-context", async () => {
    jest.spyOn(cityContextService, "getAll").mockResolvedValue({
      data: mockCityContext,
      total: 1,
      limit: 100,
      offset: 0,
    });

    const response = await request(app.getHttpServer())
      .get("/city-context")
      .expect(200);

    expect(response.body.data).toEqual(mockCityContext);
  });

  it("should filter city context records by country - GET /city-context?country=Serbia", async () => {
    jest.spyOn(cityContextService, "getAll").mockResolvedValue({
      data: mockCityContext,
      total: 1,
      limit: 100,
      offset: 0,
    });

    const response = await request(app.getHttpServer())
      .get("/city-context")
      .query({ country: "Serbia" })
      .expect(200);

    expect(response.body.data).toEqual(mockCityContext);
  });

  it("should fetch city context by ID - GET /city-context/:id", async () => {
    jest
      .spyOn(cityContextService, "getById")
      .mockResolvedValue(mockCityContext[0]);

    const response = await request(app.getHttpServer())
      .get("/city-context/1")
      .expect(200);

    expect(response.body).toEqual(mockCityContext[0]);
  });

  it("should fetch city context by city ID - GET /city-context/city/:cityId", async () => {
    jest
      .spyOn(cityContextService, "getByCityId")
      .mockResolvedValue(mockCityContext[0]);

    const response = await request(app.getHttpServer())
      .get("/city-context/city/1")
      .expect(200);

    expect(response.body).toEqual(mockCityContext[0]);
  });

  it("should delete city context by ID - DELETE /city-context/:id", async () => {
    jest
      .spyOn(cityContextService, "delete")
      .mockResolvedValue(mockCityContext[0]);

    const response = await request(app.getHttpServer())
      .delete("/city-context/1")
      .expect(200);

    expect(response.body).toEqual(mockCityContext[0]);
  });
});
