// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { YearsController } from "./years.controller";
import { YearsService } from "./years.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { YearDto } from "./years.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("YearsController", () => {
  let app: INestApplication;
  let yearsService: YearsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YearsService, PrismaService, JwtService, ConfigService],
      controllers: [YearsController],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    yearsService = module.get<YearsService>(YearsService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new year via POST /years", async () => {
    const createYearDto = { year: 2012 };

    jest.spyOn(yearsService, "create").mockResolvedValue({
      id: 1,
      ...createYearDto,
    });

    jest.spyOn(yearsService, "getByYear").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/years")
      .send(createYearDto)
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), ...createYearDto });
    expect(response.body.year).toBe(2012);
  });

  it("should not create duplicate year via POST /years", async () => {
    const createYearDto = { year: 2012 };

    jest
      .spyOn(yearsService, "getByYear")
      .mockResolvedValue({ id: 1, year: 2012 });

    const response = await request(app.getHttpServer())
      .post("/years")
      .send(createYearDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "This year already exists",
      statusCode: 409,
    });
  });

  it("should return an array of years via GET /years", async () => {
    const mockYears: YearDto[] = [
      { id: 1, year: 2012 },
      { id: 2, year: 2013 },
    ];
    jest.spyOn(yearsService, "getAll").mockResolvedValue(mockYears);

    const response = await request(app.getHttpServer())
      .get("/years")
      .expect(200);

    expect(response.body).toEqual(mockYears);
    expect(response.status).toBe(200);
  });

  it("should return a year by ID via GET /years/:id", async () => {
    const year = { id: 1, year: 2012 };

    jest.spyOn(yearsService, "getById").mockResolvedValue(year);

    const response = await request(app.getHttpServer())
      .get("/years/1")
      .expect(200);

    expect(response.body).toEqual(year);
    expect(response.body.year).toBe(2012);
  });

  it("should return 404 if year not found via GET /years/:id", async () => {
    jest.spyOn(yearsService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/years/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Year with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });
});
