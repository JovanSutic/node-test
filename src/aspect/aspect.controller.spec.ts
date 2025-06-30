// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { AspectController } from "./aspect.controller";
import { AspectService } from "./aspect.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AspectDto } from "./aspect.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("AspectController", () => {
  let app: INestApplication;
  let aspectService: AspectService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      aspect: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AspectController],
      providers: [AspectService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    aspectService = module.get<AspectService>(AspectService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new aspect via POST /aspect", async () => {
    const createAspectDto = {
      name: "insurance",
      field: "healthcare",
    };

    jest.spyOn(aspectService, "create").mockResolvedValue({
      id: 1,
      ...createAspectDto,
    });

    prismaServiceMock.aspect.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/aspect")
      .send(createAspectDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createAspectDto,
    });
    expect(response.body.name).toBe("insurance");
  });

  it("should not create duplicate via POST /aspect", async () => {
    const createAspectDto = {
      name: "insurance",
      field: "healthcare",
    };

    prismaServiceMock.aspect.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createAspectDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/aspect")
      .send(createAspectDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Aspect with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of aspect via GET /aspect", async () => {
    const mockAspects: AspectDto[] = [
      { id: 1, name: "insurance", field: "healthcare" },
      { id: 2, name: "insurance_pricing", field: "healthcare" },
    ];
    jest.spyOn(aspectService, "getAll").mockResolvedValue(mockAspects);

    const response = await request(app.getHttpServer())
      .get("/aspect")
      .expect(200);

    expect(response.body).toEqual(mockAspects);
    expect(response.status).toBe(200);
  });

  it("should return a aspect by ID via GET /aspect/:id", async () => {
    const aspect = {
      id: 1,
      name: "insurance",
      field: "healthcare",
    };

    prismaServiceMock.aspect.findUnique = jest.fn().mockResolvedValue(aspect);

    const response = await request(app.getHttpServer())
      .get("/aspect/1")
      .expect(200);

    expect(response.body).toEqual(aspect);
    expect(response.body.name).toBe("insurance");
  });

  it("should return 404 if aspect not found via GET /aspect/:id", async () => {
    prismaServiceMock.aspect.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/aspect/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Aspect with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a aspect via PUT object /aspect/", async () => {
    const aspectId = 1;
    const mockExistingAspect = {
      id: aspectId,
      name: "insurance",
      field: "healthcare",
    };
    const mockUpdatedAspect = [
      { id: aspectId, name: "insurance_pricing", field: "healthcare" },
    ];

    jest
      .spyOn(aspectService, "updateMany")
      .mockResolvedValue(mockUpdatedAspect);
    prismaServiceMock.aspect.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingAspect);

    const response = await request(app.getHttpServer())
      .put(`/aspect/`)
      .send(mockUpdatedAspect)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedAspect);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /aspect/", async () => {
    const aspectId = 1;
    const mockExistingAspect = {
      id: aspectId,
      name: "insurance",
      field: "healthcare",
    };
    const mockUpdatedAspect = [
      { id: aspectId, name: "insurance_pricing", field: "healthcare" },
    ];

    prismaServiceMock.aspect.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/aspect/`)
      .send(mockUpdatedAspect)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Aspect with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a aspect by ID via DELETE /aspect/:id", async () => {
    const aspectId = 1;
    const mockDeletedAspect = {
      id: aspectId,
      name: "insurance",
      field: "healthcare",
    };

    jest.spyOn(aspectService, "delete").mockResolvedValue(mockDeletedAspect);

    prismaServiceMock.aspect.findUnique = jest
      .fn()
      .mockResolvedValue({ id: aspectId });

    const response = await request(app.getHttpServer()).delete(
      `/aspect/${aspectId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedAspect.id);
    expect(response.body.name).toEqual(mockDeletedAspect.name);
  });

  it("should register unknown ID via DELETE /aspect/:id", async () => {
    const aspectId = 1;
    prismaServiceMock.aspect.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/aspect/${aspectId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Aspect with ID 1 not found",
      statusCode: 404,
    });
  });
});
