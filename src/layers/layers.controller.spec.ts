// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { LayersController } from "./layers.controller";
import { LayersService } from "./layers.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "../utils/auth.guard";
import request from "supertest";

const mockLayers = [
  {
    id: 1,
    cityId: 1,
    layerTypeId: 1,
    value: 100,
    value_string: null,
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

describe("LayersController", () => {
  let app: INestApplication;
  let layersService: LayersService;
  let prismaServiceMock: Partial<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock = {
      layer: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      cities: { findUnique: jest.fn() },
      city_feel: { findUnique: jest.fn(), findFirst: jest.fn() },
      layer_type: { findUnique: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LayersController],
      providers: [LayersService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = module.createNestApplication();
    layersService = module.get<LayersService>(LayersService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create layer records - POST /layers", async () => {
    const data = [
      {
        cityId: 1,
        layerTypeId: 1,
        value: 100,
        value_string: null,
      },
    ];

    prismaServiceMock.layer.findUnique = jest.fn().mockResolvedValue(null);
    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.city_feel.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.layer_type.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(layersService, "create").mockResolvedValue(mockLayers);

    const response = await request(app.getHttpServer())
      .post("/layers")
      .send(data)
      .expect(201);

    expect(response.body).toEqual(mockLayers);
  });

  it("should update layer records - PUT /layers", async () => {
    const updateData = [
      {
        id: 1,
        cityId: 1,
        layerTypeId: 1,
        value: 1000,
        value_string: null,
        created_at: new Date().toISOString(),
      },
    ];

    prismaServiceMock.layer.findUnique = jest.fn().mockResolvedValue({ id: 1 });
    prismaServiceMock.cities.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.city_feel.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });
    prismaServiceMock.layer_type.findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1 });

    jest.spyOn(layersService, "update").mockResolvedValue(updateData);

    const response = await request(app.getHttpServer())
      .put("/layers")
      .send(updateData)
      .expect(200);

    expect(response.body).toEqual(updateData);
  });

  it("should fetch all layer records - GET /layers", async () => {
    jest.spyOn(layersService, "getAll").mockResolvedValue({
      data: mockLayers,
      total: 1,
      limit: 100,
    });

    const response = await request(app.getHttpServer())
      .get("/layers")
      .expect(200);

    expect(response.body.data).toEqual(mockLayers);
  });

  it("should fetch layer by cityId - GET /layers/city/:cityId", async () => {
    prismaServiceMock.layer.findUnique = jest
      .fn()
      .mockResolvedValue(mockLayers[0]);
    jest.spyOn(layersService, "getByCityId").mockResolvedValue(mockLayers[0]);

    const response = await request(app.getHttpServer())
      .get("/layers/1")
      .expect(200);

    expect(response.body).toEqual(mockLayers[0]);
  });

  it("should delete layer by id - DELETE /layers/?id=:id", async () => {
    prismaServiceMock.layer.findUnique = jest
      .fn()
      .mockResolvedValue(mockLayers[0]);
    jest.spyOn(layersService, "delete").mockResolvedValue(mockLayers[0]);

    const response = await request(app.getHttpServer())
      .delete("/layers/?id=1")
      .expect(200);

    expect(response.body).toEqual(mockLayers[0]);
  });

  it("should delete layer by cityId and layerType - DELETE /layers/?cityId=:cityId&layerTypeId=:layerTypeId", async () => {
    prismaServiceMock.layer.findFirst = jest
      .fn()
      .mockResolvedValue(mockLayers[0]);
    prismaServiceMock.layer.findMany = jest.fn().mockResolvedValue(mockLayers);
    jest.spyOn(layersService, "delete").mockResolvedValue(mockLayers);

    const response = await request(app.getHttpServer())
      .delete("/layers/")
      .query({ cityId: "1", layerTypeId: "1" })
      .expect(200);

    expect(response.body).toEqual(mockLayers);
  });

  it("should create new layerType records - POST /layers/types/", async () => {
    const createType = {
      name: "Type 1",
      type: "money",
    };
    const type = {
      id: 1,
      name: "Type 1",
      type: "money",
    };
    jest.spyOn(layersService, "createType").mockResolvedValue([type]);

    const response = await request(app.getHttpServer())
      .post("/layers/types/")
      .send([createType])
      .expect(201);

    expect(response.body).toEqual([type]);
  });

  it("should return all layerType records - GET /layers/types/all", async () => {
    const type = {
      id: 1,
      name: "Type 1",
      type: "money",
    };
    jest.spyOn(layersService, "getAllTypes").mockResolvedValue([type]);

    const response = await request(app.getHttpServer())
      .get("/layers/types/all")
      .expect(200);

    expect(response.body).toEqual([type]);
  });

  it("should delete layerType record by id - DELETE /layers/types/:id", async () => {
    const type = {
      id: 1,
      name: "Type 1",
      type: "money",
    };
    jest.spyOn(layersService, "deleteType").mockResolvedValue(type);

    const response = await request(app.getHttpServer())
      .delete("/layers/types/1")
      .expect(200);

    expect(response.body).toEqual(type);
  });
});
