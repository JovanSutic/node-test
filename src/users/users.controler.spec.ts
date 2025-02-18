import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserDto } from "./users.dto";

describe("UserController", () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    usersService = module.get<UsersService>(UsersService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a new user via POST /users", async () => {
    const createUserDto = { name: "John Doe" };

    jest.spyOn(usersService, "create").mockResolvedValue({
      id: 1,
      ...createUserDto,
    });

    const response = await request(app.getHttpServer())
      .post("/users")
      .send(createUserDto)
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), ...createUserDto });
    expect(response.body.name).toBe("John Doe");
  });

  it('should return an array of users', async () => {
    const mockUsers: UserDto[] = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];
    jest.spyOn(usersService, 'getAll').mockResolvedValue(mockUsers);

    const response = await request(app.getHttpServer()).get('/users').expect(200);

    expect(response.body).toEqual(mockUsers);
    expect(response.status).toBe(200);
  });

  it("should return a user by ID via GET /users/:id", async () => {
    const user = { id: 1, name: "John Doe" };

    jest.spyOn(usersService, "getById").mockResolvedValue(user);

    const response = await request(app.getHttpServer())
      .get("/users/1")
      .expect(200);

    expect(response.body).toEqual(user);
  });

  it("should return 404 if user not found via GET /users/:id", async () => {
    // @ts-ignore
    jest.spyOn(usersService, "getById").mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get("/users/999")
      .expect(404);

    expect(response.body).toEqual({
      message: "User with ID 999 not found",
      error: "Not Found",
      statusCode: 404,
    });
  });
});
