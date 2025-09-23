// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ReportDto } from "./reports.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import { CitiesModule } from "../cities/cities.module";
import { CurrenciesModule } from "../helpers/currency.module";
import { PricesModule } from "../prices/prices.module";
import { ReportsService } from "./reports.service";
import { UsersModule } from "../users/users.module";
import { PricesService } from "../prices/prices.service";
import {
  bulgarianPrices,
  bulgariaCity,
  spainPrices,
  spainCity,
} from "./reportsData";

describe("ReportsController", () => {
  let app: INestApplication;
  let reportsService: ReportsService;
  let pricesService: PricesService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      reports: { findUnique: jest.fn(), findFirst: jest.fn() },
      cities: { findUnique: jest.fn(), findFirst: jest.fn() },
      prices: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CitiesModule, CurrenciesModule, PricesModule, UsersModule],
      controllers: [ReportsController],
      providers: [ReportsService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    reportsService = module.get<ReportsService>(ReportsService);
    pricesService = module.get<PricesService>(PricesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("get public report for Bulgaria via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 18,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 1440,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue(bulgariaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(bulgarianPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(39921.831);
  });

  it("get public report for Spain via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 247,
      isWorkingMom: true,
      dependents: [
        { type: "kid", isDependent: true, age: 2 },
        { type: "spouse", isDependent: true },
      ],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 2160,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue(spainCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto);

    // console.log(response.body);

    expect(response.body.net).toBe(42296.2);
  });
});
