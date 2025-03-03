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
    const createCityDto = { name: 'Belgrade', country: "Serbia", numbeo_id: 12345 };

    jest.spyOn(citiesService, "create").mockResolvedValue({
      id: 1,
      ...createCityDto,
    });

    jest.spyOn(citiesService, "getByEssentialData").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/cities")
      .send(createCityDto)
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), ...createCityDto });
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
    expect(response.body.numbeo_id).toBe(12345);
  });

  it('should return an array of cities', async () => {
    const mockCities: CityDto[] = [
      { id: 1, name: 'Belgrade', country: "Serbia", numbeo_id: 12345 },
      { id: 2, name: 'Novi Sad', country: "Serbia", numbeo_id: 12346 },
    ];
    jest.spyOn(citiesService, 'getAll').mockResolvedValue(mockCities);

    const response = await request(app.getHttpServer()).get('/cities').expect(200);

    expect(response.body).toEqual(mockCities);
    expect(response.status).toBe(200);
  });

  it("should return a city by ID via GET /cities/:id", async () => {
    const city = { id: 1, name: 'Belgrade', country: "Serbia", numbeo_id: 12345 };

    jest.spyOn(citiesService, "getById").mockResolvedValue(city);

    const response = await request(app.getHttpServer())
      .get("/cities/1")
      .expect(200);

    expect(response.body).toEqual(city);
    expect(response.body.name).toBe("Belgrade");
    expect(response.body.country).toBe("Serbia");
    expect(response.body.numbeo_id).toBe(12345);
  });

  it("should return 404 if city not found via GET /cities/:id", async () => {
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

  it('should update a city by the PUT object /cities/', async () => {
    const cityId = 1;
    const mockExistingCity = { id: cityId, name: 'Belgrade', country: "Serbia", numbeo_id: 12345 };
    const mockUpdatedCity = [{ id: cityId, name: 'Novi Sad', country: "Serbia", numbeo_id: 11111 }];

    
    jest.spyOn(citiesService, 'updateSingle').mockResolvedValue(mockUpdatedCity);
    jest.spyOn(citiesService, "getById").mockResolvedValue(mockExistingCity);
    
    const response = await request(app.getHttpServer())
      .put(`/cities/`)
      .send(mockUpdatedCity)
      .expect(200);
  
    expect(response.body).toEqual(mockUpdatedCity);
    expect(response.status).toBe(200);
  });

  it('should delete a city by ID via DELETE /cities/:id', async () => {
    const cityId = 1;
    const mockDeletedCity = { id: cityId, name: 'Belgrade', country: "Serbia", numbeo_id: 12345 };
    
    jest.spyOn(citiesService, 'delete').mockResolvedValue(mockDeletedCity);
    jest.spyOn(citiesService, "getById").mockResolvedValue(mockDeletedCity);
    
    const response = await request(app.getHttpServer())
      .delete(`/cities/${cityId}`)
      .expect(200);
  
    expect(response.body).toEqual(mockDeletedCity);
    expect(response.status).toBe(200);
  });

});
