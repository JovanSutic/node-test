// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { SocialLifestyleController } from "./social_lifestyle.controller";
import { SocialLifestyleService } from "./social_lifestyle.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SocialLifestyleDto } from "./social_lifestyle.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("SocialLifestyleController", () => {
  let app: INestApplication;
  let socialLifestyleService: SocialLifestyleService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      cities: { findUnique: jest.fn() },
      years: { findUnique: jest.fn() },
      city_social_lifestyle_report: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialLifestyleController],
      providers: [
        SocialLifestyleService,
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
    socialLifestyleService = module.get<SocialLifestyleService>(
      SocialLifestyleService
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new social lifestyle via POST /social_lifestyle", async () => {
    const createSocialDto = {
      cityId: 1,
      yearId: 1,
      avg_price: 200,
      currency: "EUR",
    };

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });

    prismaServiceMock.city_social_lifestyle_report.findFirst = jest
      .fn()
      .mockResolvedValue(null);

    jest.spyOn(socialLifestyleService, "create").mockResolvedValue({
      id: 1,
      ...createSocialDto,
    });

    const response = await request(app.getHttpServer())
      .post("/social_lifestyle")
      .send(createSocialDto)
      .expect(201);

    expect(response.body.avg_price).toBe(200);
    expect(response.body.currency).toBe("EUR");
    expect(response.body.cityId).toBe(1);
    expect(response.body.yearId).toBe(1);
  });

  it("should return an array of social lifestyles via GET /social_lifestyle", async () => {
    const mockSocialLifestyle: SocialLifestyleDto[] = [
      {
        id: 1,
        cityId: 1,
        yearId: 1,
        avg_price: 200,
        currency: "EUR",
        created_at: "2025-03-26T19:50:30.809Z",
      },
      {
        id: 2,
        cityId: 2,
        yearId: 1,
        avg_price: 300,
        currency: "EUR",
        created_at: "2025-03-26T19:50:30.809Z",
      },
    ];

    const mockPaginatedResponse = {
        data: mockSocialLifestyle,
        total: 2,
        limit: 10,
        offset: 0,
      };

    const spy = jest
      .spyOn(socialLifestyleService, "getAll")
      .mockResolvedValue(mockPaginatedResponse);

    const response = await request(app.getHttpServer())
      .get("/social_lifestyle")
      .expect(200);

    expect(response.body).toEqual(mockPaginatedResponse);
  });

  it("should return a social lifestyle by ID via GET /social_lifestyle/:id", async () => {
    const socialLifestyle = {
      id: 1,
      cityId: 1,
      yearId: 1,
      avg_price: 200,
      currency: "EUR",
      created_at: "2025-03-26T19:50:30.809Z",
    };

    prismaServiceMock.city_social_lifestyle_report.findUnique = jest
      .fn()
      .mockResolvedValue(socialLifestyle);

    jest
      .spyOn(socialLifestyleService, "getById")
      .mockResolvedValue(socialLifestyle);

    const response = await request(app.getHttpServer())
      .get("/social_lifestyle/1")
      .expect(200);

    expect(response.body).toEqual(socialLifestyle);
    expect(response.body.avg_price).toBe(200);
    expect(response.body.currency).toBe("EUR");
    expect(response.body.cityId).toBe(1);
    expect(response.body.yearId).toBe(1);
  });

  it("should return 404 if social lifestyle not found via GET /social_lifestyle/:id", async () => {
    prismaServiceMock.city_social_lifestyle_report.findUnique = jest
      .fn()
      .mockResolvedValue(null);
    jest.spyOn(socialLifestyleService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/social_lifestyle/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Social lifestyle with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a social lifestyle via PUT object /social_lifestyle/", async () => {
    const priceId = 1;
    const mockExistingLifestyle = {
      id: priceId,
      cityId: 1,
      yearId: 1,
      avg_price: 200,
      currency: "EUR",
      created_at: "2025-03-26T19:50:30.809Z",
    };
    const mockUpdatedLifestyle = [
      {
        id: priceId,
        cityId: 1,
        yearId: 1,
        avg_price: 300,
        currency: "EUR",
        created_at: "2025-03-26T19:50:30.809Z",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });
    prismaServiceMock.city_social_lifestyle_report.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingLifestyle);

    jest
      .spyOn(socialLifestyleService, "updateMany")
      .mockResolvedValue(mockUpdatedLifestyle);

    const response = await request(app.getHttpServer())
      .put(`/social_lifestyle/`)
      .send(mockUpdatedLifestyle)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedLifestyle);
  });

  it("should register unknown ID via PUT object /social_lifestyle/", async () => {
    const priceId = 1;
    const mockExistingLifestyle = {
      id: priceId,
      cityId: 1,
      yearId: 1,
      avg_price: 200,
      currency: "EUR",
      created_at: "2025-03-26T19:50:30.809Z",
    };
    const mockUpdatedLifestyle = [
      {
        id: priceId,
        cityId: 1,
        yearId: 1,
        avg_price: 300,
        currency: "EUR",
        created_at: "2025-03-26T19:50:30.809Z",
      },
    ];

    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.years.findUnique = jest.fn().mockResolvedValue({ id: 1 });
    prismaServiceMock.city_social_lifestyle_report.findUnique = jest
      .fn()
      .mockResolvedValue(null);

    jest
      .spyOn(socialLifestyleService, "updateMany")
      .mockResolvedValue(mockUpdatedLifestyle);

    const response = await request(app.getHttpServer())
      .put(`/social_lifestyle/`)
      .send(mockUpdatedLifestyle)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Social lifestyle with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a social lifestyle by ID via DELETE /social_lifestyle/:id", async () => {
    const priceId = 1;
    const mockDeleteLifestyle = {
      id: priceId,
      cityId: 1,
      yearId: 1,
      avg_price: 200,
      currency: "EUR",
      created_at: "2025-03-26T19:50:30.809Z",
    };

    prismaServiceMock.city_social_lifestyle_report.findUnique = jest
      .fn()
      .mockResolvedValue(mockDeleteLifestyle);
    jest
      .spyOn(socialLifestyleService, "delete")
      .mockResolvedValue(mockDeleteLifestyle);

    const response = await request(app.getHttpServer())
      .delete(`/social_lifestyle/${priceId}`)
      .expect(200);

    expect(response.body).toEqual(mockDeleteLifestyle);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via DELETE /social_lifestyle/:id", async () => {
    const priceId = 1;
    prismaServiceMock.city_social_lifestyle_report.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .delete(`/social_lifestyle/${priceId}`)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Social lifestyle with ID 1 not found",
      statusCode: 404,
    });
  });
});
