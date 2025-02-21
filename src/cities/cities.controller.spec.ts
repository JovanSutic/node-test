// @ts-nocheck
import { Test, TestingModule } from "@nestjs/testing";
import { CitiesController } from "./cities.controller";
import { CitiesService } from "./cities.service";
import request from "supertest";
import type { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CityDto } from "./cities.dto";

describe("CityController", () => {
  let app: INestApplication;
  let citiesService: CitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [CitiesService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    citiesService = module.get<CitiesService>(CitiesService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new city via POST /cities", async () => {
    const createCityDto = { name: 'Belgrade', country: "Serbia" };

    jest.spyOn(citiesService, "create").mockResolvedValue({
      id: 1,
      ...createCityDto,
    });

    const response = await request(app.getHttpServer())
      .post("/cities")
      .send(createCityDto)
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), ...createCityDto });
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
  });

  it('should return an array of cities', async () => {
    const mockCities: CityDto[] = [
      { id: 1, name: 'Belgrade', country: "Serbia" },
      { id: 2, name: 'Novi Sad', country: "Serbia" },
    ];
    jest.spyOn(citiesService, 'getAll').mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer()).get('/cities').expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return a city by ID via GET /cities/:id", async () => {
    const city = { id: 1, name: 'Belgrade', country: "Serbia" };

    jest.spyOn(citiesService, "getById").mockResolvedValue(city);

    const response = await request(app.getHttpServer())
      .get("/cities/1")
      .expect(200);

    expect(response.body).toEqual(city);
  });

  it("should return 404 if city not found via GET /cities/:id", async () => {
    // @ts-ignore
    jest.spyOn(citiesService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/cities/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "City with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });
});
