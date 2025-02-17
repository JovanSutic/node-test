import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name } = createUserDto;

    try {
      return await this.prisma.users.create({
        data: {
          name,
        },
      });
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while creating the user in the database"
      );
    }
  }

  async getAll() {
    try {
      return await this.prisma.users.findMany();
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all users from the database"
      );
    }
  }

  async getById(id: number) {
    try {
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching user with the id: ${id}`
      );
    }
  }
}
