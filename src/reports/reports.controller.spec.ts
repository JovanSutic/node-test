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
import { DefValueService } from "../def_value/def_value.service";

import {
  bulgarianPrices,
  bulgariaCity,
  spainPrices,
  spainCity,
  portugalCity,
  italyCity,
  czechCity,
  serbiaCity,
  mockDefValuesSerbia,
  mockDefinitions,
  mockDefValuesBulgaria,
  mockDefValuesCzech,
  mockDefValuesItaly,
  mockDefValuesPortugal,
  mockDefValuesSpain,
} from "./reportsData";

describe("ReportsController", () => {
  let app: INestApplication;
  let reportsService: ReportsService;
  let pricesService: PricesService;
  let defValueService: DefValueService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      reports: { findUnique: jest.fn(), findFirst: jest.fn() },
      cities: { findUnique: jest.fn(), findFirst: jest.fn() },
      definition: { findMany: jest.fn() },
      def_value: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CitiesModule, CurrenciesModule, PricesModule, UsersModule],
      controllers: [ReportsController],
      providers: [
        ReportsService,
        DefValueService,
        PrismaService,
        JwtService,
        ConfigService,
      ],
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
    defValueService = module.get<DefValueService>(DefValueService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("get public report for couple Spain via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 218,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 60000,
          accountantCost: 2160,
          expensesCost: 0,
        },
        {
          isUSCitizen: false,
          currency: "eur",
          income: 60000,
          accountantCost: 2160,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesSpain);
    prismaServiceMock.cities.findUnique.mockResolvedValue(spainCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(93438.2);
  });

  it("get public report for single Spain via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 218,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 60000,
          accountantCost: 2160,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesSpain);
    prismaServiceMock.cities.findUnique.mockResolvedValue(spainCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(46719.1);
  });

  it("get public report for couple Portugal via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 152,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 100000,
          accountantCost: 1800,
          expensesCost: 0,
          age: 29,
        },
        {
          isUSCitizen: false,
          currency: "eur",
          income: 55000,
          accountantCost: 1800,
          expensesCost: 0,
          age: 26,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(
      mockDefValuesPortugal
    );
    prismaServiceMock.cities.findUnique.mockResolvedValue(portugalCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(142057.26);
  });

  it("get public report for single Portugal via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 152,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 1800,
          expensesCost: 0,
          age: 29,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(
      mockDefValuesPortugal
    );
    prismaServiceMock.cities.findUnique.mockResolvedValue(portugalCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(48190.93);
  });

  it("get public report for single FLAT Italy via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 249,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 80000,
          accountantCost: 1800,
          expensesCost: 0,
          workType: "software",
          isNew: true,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesItaly);
    prismaServiceMock.cities.findUnique.mockResolvedValue(italyCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(61584);
  });

  it("get public report for single IMPATIATE Italy via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 249,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 90000,
          accountantCost: 1800,
          expensesCost: 0,
          isSpecialist: true,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesItaly);
    prismaServiceMock.cities.findUnique.mockResolvedValue(italyCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(63595.19);
  });

  it("get public report for single ORDINARY Italy via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 249,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 90000,
          accountantCost: 1800,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesItaly);
    prismaServiceMock.cities.findUnique.mockResolvedValue(italyCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(42921.149999999994);
  });

  it("get public report for single FLAT Czech via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 61,
      isWorkingMom: false,
      dependents: [
        { type: "kid", isDependent: true, age: 5 },
        { type: "spouse", isDependent: true },
      ],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 80000,
          accountantCost: 1440,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesCzech);
    prismaServiceMock.cities.findUnique.mockResolvedValue(czechCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(65360);
  });

  it("get public report for single REGULAR Czech via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 61,
      isWorkingMom: false,
      dependents: [
        { type: "kid", isDependent: true, age: 2 },
        { type: "kid", isDependent: true, age: 1 },
        { type: "spouse", isDependent: true },
      ],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 100000,
          accountantCost: 1440,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesCzech);
    prismaServiceMock.cities.findUnique.mockResolvedValue(czechCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(87241);
  });

  it("get public report for single EEOD Bulgaria via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 18,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 85000,
          accountantCost: 1200,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(
      mockDefValuesBulgaria
    );
    prismaServiceMock.cities.findUnique.mockResolvedValue(bulgariaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(70052.031);
  });

  it("get public report for double EEOD Bulgaria via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 18,
      isWorkingMom: false,
      dependents: [],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 1200,
          expensesCost: 0,
        },
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 1200,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(
      mockDefValuesBulgaria
    );
    prismaServiceMock.cities.findUnique.mockResolvedValue(bulgariaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(81282.141);
  });

  it("get public report for single FREELANCE Bulgaria via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 18,
      isWorkingMom: false,
      dependents: [
        { type: "kid", isDependent: true, age: 4 },
        { type: "spouse", isDependent: true },
      ],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 100000,
          accountantCost: 1200,
          expensesCost: 0,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(
      mockDefValuesBulgaria
    );
    prismaServiceMock.cities.findUnique.mockResolvedValue(bulgariaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(83543);
  });

  it("get public report for single FLAT Serbia via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 1,
      isWorkingMom: false,
      dependents: [{ type: "spouse", isDependent: true }],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 50000,
          accountantCost: 0,
          expensesCost: 0,
          age: 40,
          isIndependent: true,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesSerbia);
    prismaServiceMock.cities.findUnique.mockResolvedValue(serbiaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(45680);
  });

  it("get public report for single BOOKED Serbia via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 1,
      isWorkingMom: false,
      dependents: [{ type: "kid", isDependent: true, age: 5 }],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 80000,
          accountantCost: 1440,
          expensesCost: 0,
          age: 40,
          isIndependent: true,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesSerbia);
    prismaServiceMock.cities.findUnique.mockResolvedValue(serbiaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(66149.606);
  });

  it("get public report for single LLC Serbia via POST /reports/public", async () => {
    const publicPostDto = {
      cityId: 1,
      isWorkingMom: false,
      dependents: [{ type: "kid", isDependent: true, age: 5 }],
      incomes: [
        {
          isUSCitizen: false,
          currency: "eur",
          income: 100000,
          accountantCost: 1440,
          expensesCost: 0,
          age: 40,
          isIndependent: false,
        },
      ],
    };

    prismaServiceMock.definition.findMany.mockResolvedValue(mockDefinitions);
    prismaServiceMock.def_value.findMany.mockResolvedValue(mockDefValuesSerbia);
    prismaServiceMock.cities.findUnique.mockResolvedValue(serbiaCity);
    jest.spyOn(pricesService, "getAll").mockResolvedValue(spainPrices);

    const response = await request(app.getHttpServer())
      .post("/reports/public")
      .send(publicPostDto)
      .expect(201);

    expect(response.body.net).toBe(67269.278);
  });
});
