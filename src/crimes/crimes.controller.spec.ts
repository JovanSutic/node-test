// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { CrimesController } from "./crimes.controller";
import { CrimesService } from "./crimes.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import request from "supertest";

const mockCrimeRanks = [
  {
    id: 1,
    cityId: 1,
    yearId: 16,
    crimeAspectId: 2,
    rank: 65.2,
    created_at: new Date().toISOString(),
  },
];

const mockAspects = [
  {
    id: 1,
    name: "Assault",
    created_at: new Date().toISOString(),
  },
];

describe("CrimesController", () => {
  let app: INestApplication;
  let crimesService: CrimesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn(), findFirst: jest.fn() },
      years: { findUnique: jest.fn(), findFirst: jest.fn() },
      crime_aspects: { findUnique: jest.fn(), findFirst: jest.fn() },
      crime_ranks: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrimesController],
      providers: [CrimesService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    crimesService = module.get<CrimesService>(CrimesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create new crime ranks - POST /crimes", async () => {
    const data = {
      cityId: 1,
      yearId: 16,
      crimeAspectId: 2,
      rank: 65.2,
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 16 });
    prismaServiceMock.crime_aspects.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 2 });
    prismaServiceMock.crime_ranks.findUnique = jest
      .fn()
      .mockResolvedValue(null);

    jest.spyOn(crimesService, "createRanks").mockResolvedValue([data]);

    const response = await request(app.getHttpServer())
      .post("/crimes")
      .send([data])
      .expect(201);

    expect(response.body).toEqual([data]);
  });

  it("should update crime ranks - PUT /crimes", async () => {
    const data = [
      {
        id: 1,
        city_id: 1,
        year_id: 16,
        crime_aspect_id: 2,
        rank: 65.2,
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 16 });
    prismaServiceMock.crime_aspects.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 2 });
    prismaServiceMock.crime_ranks.findUnique = jest
      .fn()
      .mockResolvedValue(data);

    jest.spyOn(crimesService, "updateRanks").mockResolvedValue([data]);

    const response = await request(app.getHttpServer())
      .put("/crimes")
      .send([data])
      .expect(200);

    expect(response.body).toEqual([data]);
  });

  it("should fetch all crime ranks - GET /crimes", async () => {
    const spy = jest
      .spyOn(crimesService, "getAllRanks")
      .mockResolvedValue(mockCrimeRanks);

    const response = await request(app.getHttpServer())
      .get("/crimes")
      .expect(200);

    expect(response.body).toEqual(mockCrimeRanks);
  });

  it("should return calculated safety summary - GET /crimes/summary", async () => {
    const mockSummary = {
      overallCrimeConcernIndex: 58.7,
      personalSafetyScore: 43.7,
      crimeEscalationIndicator: 73.2,
    };

    const spy = jest
      .spyOn(crimesService, "getCitySafetySummary")
      .mockResolvedValue(mockSummary);

    const response = await request(app.getHttpServer())
      .get("/crimes/summary?cityId=1&yearId=16")
      .expect(200);

    expect(response.body).toEqual(mockSummary);
  });

  it("should return average crime rank - GET /crimes/average", async () => {
    const mockAverage = {
      aspectId: 14,
      yearId: 15,
      country: "Serbia",
      count: 7,
      average: 61.34,
    };

    jest
      .spyOn(crimesService, "getAverageCrimeRank")
      .mockResolvedValue(mockAverage);

    const response = await request(app.getHttpServer())
      .get("/crimes/average")
      .query({ aspectId: "14", yearId: "15", country: "Serbia" })
      .expect(200);

    expect(response.body).toEqual(mockAverage);
  });

  it("should return cities with incomplete crime ranks - GET /crimes/missing-cities", async () => {
    const mockCities = [
      { id: 1, name: "CityA", crime_ranks: [{ id: 1 }, { id: 2 }] },
      { id: 2, name: "CityB", crime_ranks: [{ id: 3 }] },
    ];

    jest
      .spyOn(crimesService, "getCitiesMissingCrimeRanks")
      .mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer())
      .get("/crimes/missing-cities")
      .query({ count: "3", yearId: "16" })
      .expect(200);

    expect(response.body).toEqual(mockCities);
  });

  it("should create new crime aspect - POST /crimes/aspects", async () => {
    const aspect = { name: "Robbery" };
    const createdAspect = {
      ...aspect,
      id: 1,
      created_at: new Date().toISOString(),
    };

    prismaServiceMock.crime_aspects.findUnique = jest
      .fn()
      .mockResolvedValue(null);

    jest.spyOn(crimesService, "createAspect").mockResolvedValue(createdAspect);

    const response = await request(app.getHttpServer())
      .post("/crimes/aspects")
      .send(aspect)
      .expect(201);

    expect(response.body).toEqual(createdAspect);
  });

  it("should return all aspects - GET /crimes/aspects", async () => {
    const spy = jest
      .spyOn(crimesService, "getAllAspects")
      .mockResolvedValue(mockAspects);

    const response = await request(app.getHttpServer())
      .get("/crimes/aspects")
      .expect(200);

    expect(response.body).toEqual(mockAspects);
  });

  it("should delete aspect - DELETE /crimes/aspects/:id", async () => {
    const aspectId = "1";
    const deleted = { ...mockAspects[0] };

    const spy = jest
      .spyOn(crimesService, "deleteAspect")
      .mockResolvedValue(deleted);

    const response = await request(app.getHttpServer())
      .delete(`/crimes/aspects/${aspectId}`)
      .expect(200);

    expect(response.body).toEqual(deleted);
  });
});
