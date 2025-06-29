// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { DefinitionController } from "./definition.controller";
import { DefinitionService } from "./definition.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DefinitionDto } from "./definition.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";

describe("DefinitionController", () => {
  let app: INestApplication;
  let definitionService: DefinitionService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      definition: { findUnique: jest.fn(), findFirst: jest.fn() },
      aspect: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefinitionController],
      providers: [DefinitionService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    definitionService = module.get<DefinitionService>(DefinitionService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new definition via POST /definition", async () => {
    const createDefinitionDto = {
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };

    prismaServiceMock.aspect.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(definitionService, "create").mockResolvedValue({
      id: 1,
      ...createDefinitionDto,
    });

    prismaServiceMock.definition.findFirst = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/definition")
      .send(createDefinitionDto)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      ...createDefinitionDto,
    });
    expect(response.body.label).toBe("Tier 3 – SSN Only");
  });

  it("should not create duplicate via POST /definition", async () => {
    const createDefinitionDto = {
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };

    prismaServiceMock.definition.findFirst = jest
      .fn()
      .mockResolvedValue({ ...createDefinitionDto, id: 1 });

    const response = await request(app.getHttpServer())
      .post("/definition")
      .send(createDefinitionDto)
      .expect(409);

    expect(response.body).toEqual({
      error: "Conflict",
      message: "Definition with this name already exists",
      statusCode: 409,
    });
  });

  it("should return an array of definition via GET /definition", async () => {
    const mockAspects: AspectDto[] = [
      { id: 1, label: "Tier 3 – SSN Only", type: "list", aspectId: 1 },
      {
        id: 2,
        label: "Tier 2 – SSN + Supplemental Private",
        type: "list",
        aspectId: 1,
      },
    ];
    jest.spyOn(definitionService, "getAll").mockResolvedValue(mockAspects);

    const response = await request(app.getHttpServer())
      .get("/definition")
      .expect(200);

    expect(response.body).toEqual(mockAspects);
    expect(response.status).toBe(200);
  });

  it("should return a definition by ID via GET /definition/:id", async () => {
    const definition = {
      id: 1,
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };

    prismaServiceMock.definition.findUnique = jest
      .fn()
      .mockResolvedValue(definition);

    const response = await request(app.getHttpServer())
      .get("/definition/1")
      .expect(200);

    expect(response.body).toEqual(definition);
    expect(response.body.label).toBe("Tier 3 – SSN Only");
  });

  it("should return 404 if definition not found via GET /definition/:id", async () => {
    prismaServiceMock.definition.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/definition/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "Definition with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("should update a definition via PUT object /definition/", async () => {
    const definitionId = 1;
    const mockExistingDefinition = {
      id: definitionId,
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };
    const mockUpdatedDefinition = [
      {
        id: definitionId,
        label: "Tier 2 – SSN + Supplemental Private",
        type: "list",
        aspectId: 1,
      },
    ];

    prismaServiceMock.aspect.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest
      .spyOn(definitionService, "updateMany")
      .mockResolvedValue(mockUpdatedDefinition);
    prismaServiceMock.definition.findUnique = jest
      .fn()
      .mockResolvedValue(mockExistingDefinition);

    const response = await request(app.getHttpServer())
      .put(`/definition/`)
      .send(mockUpdatedDefinition)
      .expect(200);

    expect(response.body).toEqual(mockUpdatedDefinition);
    expect(response.status).toBe(200);
  });

  it("should register unknown ID via PUT object /definition/", async () => {
    const definitionId = 1;
    const mockExistingDefinition = {
      id: definitionId,
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };
    const mockUpdatedDefinition = [
      {
        id: definitionId,
        label: "Tier 2 – SSN + Supplemental Private",
        type: "list",
        aspectId: 1,
      },
    ];

    prismaServiceMock.aspect.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    prismaServiceMock.definition.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .put(`/definition/`)
      .send(mockUpdatedDefinition)
      .expect(404);

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Definition with ID 1 not found",
      statusCode: 404,
    });
  });

  it("should delete a definition by ID via DELETE /definition/:id", async () => {
    const definitionId = 1;
    const mockDeletedAspect = {
      id: definitionId,
      label: "Tier 3 – SSN Only",
      type: "list",
      aspectId: 1,
    };

    jest
      .spyOn(definitionService, "delete")
      .mockResolvedValue(mockDeletedAspect);

    prismaServiceMock.definition.findUnique = jest
      .fn()
      .mockResolvedValue({ id: definitionId });

    const response = await request(app.getHttpServer()).delete(
      `/definition/${definitionId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(mockDeletedAspect.id);
    expect(response.body.name).toEqual(mockDeletedAspect.name);
  });

  it("should register unknown ID via DELETE /definition/:id", async () => {
    const definitionId = 1;
    prismaServiceMock.definition.findUnique = jest.fn().mockResolvedValue(null);

    const response = await request(app.getHttpServer()).delete(
      `/definition/${definitionId}`
    );

    expect(response.body).toEqual({
      error: "Not Found",
      message: "Definition with ID 1 not found",
      statusCode: 404,
    });
  });
});
