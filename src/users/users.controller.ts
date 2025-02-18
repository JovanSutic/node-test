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
import { CreateUserDto } from "./users.dto";
import { UsersService } from "./users.service";
import { ValidationPipe } from "./users.validation.pipe";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(ValidationPipe) // Apply the custom validation pipe
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
