// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { CityFeelController } from "./city_feel.controller";
import { CityFeelService } from "./city_feel.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import request from "supertest";

const mockCityFeel = [
  {
    id: 1,
    cityId: 1,
    budget: 1880.8,
    rank: 1,
    tags: "tag",
    created_at: new Date().toISOString(),
    city: {
      id: 1,
      name: "Belgrade",
      country: "Serbia",
      lat: 44.7866,
      lng: 20.4489,
    },
  },
];

describe("CityFeelController", () => {
  let app: INestApplication;
  let cityFeelService: CityFeelService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn() },
      city_feel: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityFeelController],
      providers: [CityFeelService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = module.createNestApplication();
    cityFeelService = module.get<CityFeelService>(CityFeelService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create city feel records - POST /city-feel", async () => {
    const data = [
      {
        cityId: 1,
        budget: 1880.8,
        rank: 1,
        tags: "tag",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(cityFeelService, "create").mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post("/city-feel")
      .send(data)
      .expect(201);

    expect(response.body).toEqual(data);
  });

  it("should update city feel records - PUT /city-feel", async () => {
    const updateData = [
      {
        id: 1,
        cityId: 1,
        budget: 2000,
        rank: 2,
        tags: "updated",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
      prismaServiceMock.city_feel.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(cityFeelService, "update").mockResolvedValue(updateData);

    const response = await request(app.getHttpServer())
      .put("/city-feel")
      .send(updateData)
      .expect(200);

    expect(response.body).toEqual(updateData);
  });

    it("should fetch all city feel records - GET /city-feel", async () => {
      jest.spyOn(cityFeelService, "getAll").mockResolvedValue({
        data: mockCityFeel,
        total: 1,
        limit: 100,
      });

      const response = await request(app.getHttpServer())
        .get("/city-feel")
        .expect(200);

      expect(response.body.data).toEqual(mockCityFeel);
    });

    it("should filter city feel records by country - GET /city-feel?country=Serbia", async () => {
      jest.spyOn(cityFeelService, "getAll").mockResolvedValue({
        data: mockCityFeel,
        total: 1,
        limit: 100,
      });

      const response = await request(app.getHttpServer())
        .get("/city-feel")
        .query({ country: "Serbia" })
        .expect(200);

      expect(response.body.data).toEqual(mockCityFeel);
    });

    it("should fetch city feel by cityId - GET /city-feel/:cityId", async () => {
      jest.spyOn(cityFeelService, "getByCityId").mockResolvedValue(mockCityFeel[0]);

      const response = await request(app.getHttpServer())
        .get("/city-feel/1")
        .expect(200);

      expect(response.body).toEqual(mockCityFeel[0]);
    });

    it("should delete city feel by cityId - DELETE /city-feel/:cityId", async () => {
      jest.spyOn(cityFeelService, "delete").mockResolvedValue(mockCityFeel[0]);

      const response = await request(app.getHttpServer())
        .delete("/city-feel/1")
        .expect(200);

      expect(response.body).toEqual(mockCityFeel[0]);
    });
});
