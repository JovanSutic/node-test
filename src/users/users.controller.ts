import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto, UserDto } from "./users.dto";
import { UsersService } from "./users.service";
import { ValidationPipe } from "./users.validation.pipe";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("users")
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: "Create a user." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a user.",
    type: UserDto,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while creating the user"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all users." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved all users.",
    isArray: true,
    type: UserDto,
  })
  async getAll() {
    try {
      return await this.usersService.getAll();
    } catch (error: any) {
      throw new BadRequestException(
        error.message || "An error occurred while fetching all the users"
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Return user by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved user by id.",
    type: UserDto,
  })
  async getById(@Param("id") id: string) {
    try {
      const result = await this.usersService.getById(Number(id));
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return result;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the user with id: ${id}`
      );
    }
  }
}
