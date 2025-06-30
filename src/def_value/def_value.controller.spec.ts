// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { DefValueController } from "./def_value.controller";
import { DefValueService } from "./def_value.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DefValueDto } from "./def_value.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("DefinitionController", () => {
  let app: INestApplication;
  let defValueService: DefValueService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      def_value: { findUnique: jest.fn(), findFirst: jest.fn() },
      definition: { findUnique: jest.fn(), findFirst: jest.fn() },
      cities: { findUnique: jest.fn(), findFirst: jest.fn() },
      countries: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefValueController],
      providers: [DefValueService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    defValueService = module.get<DefValueService>(DefValueService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new def_value via POST /def_value", async () => {
    const createDefValueDto = {
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };

    prismaServiceMock.definition.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.countries.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(defValueService, "create").mockResolvedValue({
      id: 1,
      ...createDefValueDto,
    });

    prismaServiceMock.def_value.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/def_value")
      .send(createDefValueDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createDefValueDto,
    });
    expect(response.body.value).toBe(createDefValueDto.value);
  });

  it("should not create duplicate via POST /def_value", async () => {
    const createDefValueDto = {
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };

    prismaServiceMock.def_value.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createDefValueDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/def_value")
      .send(createDefValueDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Def value with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of def_value via GET /def_value", async () => {
    const mockAspects: AspectDto[] = [
      {
        id: 1,
        definitionId: 1,
        countryId: 1,
        value: "Assigned general practitioner (GP / medico di base)",
        type: "item",
        visible: true,
      },
      {
        id: 2,
        definitionId: 1,
        countryId: 1,
        value: "Access to public specialists (with referral)",
        type: "item",
        visible: true,
      },
    ];
    jest.spyOn(defValueService, "getAll").mockResolvedValue(mockAspects);

    const response = await request(app.getHttpServer())
      .get("/def_value")
      .expect(200);

    expect(response.body).toEqual(mockAspects);
    expect(response.status).toBe(200);
  });

  it("should return a def_value by ID via GET /def_value/:id", async () => {
    const def_value = {
      id: 1,
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };

    prismaServiceMock.def_value.findUnique = jest
      .fn()
      .mockResolvedValue(def_value);

    const response = await request(app.getHttpServer())
      .get("/def_value/1")
      .expect(200);

    expect(response.body).toEqual(def_value);
    expect(response.body.value).toBe(def_value.value);
  });

  it("should return 404 if def_value not found via GET /def_value/:id", async () => {
    prismaServiceMock.def_value.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/def_value/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Def value with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a def_value via PUT object /def_value/", async () => {
    const defValueId = 1;
    const mockExistingDefValue = {
      id: defValueId,
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };
    const mockUpdatedDefValue = [
      {
        id: defValueId,
        definitionId: 1,
        countryId: 1,
        value: "Access to public specialists (with referral)",
        type: "item",
        visible: true,
      },
    ];

    prismaServiceMock.definition.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.countries.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest
      .spyOn(defValueService, "updateMany")
      .mockResolvedValue(mockUpdatedDefValue);
    prismaServiceMock.def_value.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingDefValue);

    const response = await request(app.getHttpServer())
      .put(`/def_value/`)
      .send(mockUpdatedDefValue)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedDefValue);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /def_value/", async () => {
    const defValueId = 1;
    const mockExistingDefValue = {
      id: defValueId,
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };
    const mockUpdatedDefValue = [
      {
        id: defValueId,
        definitionId: 1,
        countryId: 1,
        value: "Access to public specialists (with referral)",
        type: "item",
        visible: true,
      },
    ];

    prismaServiceMock.def_value.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    prismaServiceMock.def_value.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/def_value/`)
      .send(mockUpdatedDefValue)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Def value with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a def_value by ID via DELETE /def_value/:id", async () => {
    const defValueId = 1;
    const mockDeletedDefValue = {
      id: defValueId,
      definitionId: 1,
      countryId: 1,
      value: "Assigned general practitioner (GP / medico di base)",
      type: "item",
      visible: true,
    };

    jest
      .spyOn(defValueService, "delete")
      .mockResolvedValue(mockDeletedDefValue);

    prismaServiceMock.def_value.findUnique = jest
      .fn()
      .mockResolvedValue({ id: defValueId });

    const response = await request(app.getHttpServer()).delete(
      `/def_value/${defValueId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedDefValue.id);
    expect(response.body.name).toEqual(mockDeletedDefValue.name);
  });

  it("should register unknown ID via DELETE /def_value/:id", async () => {
    const defValueId = 1;
    prismaServiceMock.def_value.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/def_value/${defValueId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Def value with ID 1 not found",
      statusCode: 404,
    });
  });
});
