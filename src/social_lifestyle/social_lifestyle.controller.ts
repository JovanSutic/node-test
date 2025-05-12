import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
  Put,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  CreateSocialLifestyleDto,
  SocialLifestyleDto,
  SocialLifestyleQueryDto,
} from "./social_lifestyle.dto";
import { SocialLifestyleService } from "./social_lifestyle.service";
import {
  StaticFieldValidationPipe,
  ForeignKeyValidationPipe,
  ExistenceValidationPipe,
  UniqueExistenceValidation,
} from "./social_lifestyle.validation.pipe";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../utils/auth.guard";

@Controller("social_lifestyle")
@ApiTags("social_lifestyle")
export class SocialLifestyleController {
  constructor(
    private readonly socialLifestyleService: SocialLifestyleService
  ) {}

  @Post()
  @UseGuards()
  @UsePipes(
    StaticFieldValidationPipe,
    ForeignKeyValidationPipe,
    ExistenceValidationPipe
  )
  @ApiOperation({ summary: "Create the new social lifestyle." })
  @ApiResponse({
    status: 201,
    description: "Successfully created a social lifestyle",
    type: SocialLifestyleDto,
    examples: {
      single: {
        summary: "SOCIAL_LIFESTYLE DTO",
        value: {
          id: 1,
          cityId: 1,
          yearId: 1,
          avg_price: 200,
          currency: "EUR",
          type: "SOLO",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        summary: "Count",
        value: { count: 100 },
      },
    },
  })
  @ApiBody({
    description: "The data to create new social lifestyle",
    type: CreateSocialLifestyleDto,
    examples: {
      single: {
        value: {
          cityId: 1,
          yearId: 1,
          avg_price: 200,
          currency: "EUR",
          type: "SOLO",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
      multiple: {
        value: [
          {
            cityId: 1,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
          {
            cityId: 2,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async create(
    @Body()
    createSocialLifestyleDto:
      | CreateSocialLifestyleDto
      | CreateSocialLifestyleDto[]
  ) {
    try {
      return await this.socialLifestyleService.create(createSocialLifestyleDto);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        error.message || "An error occurred while creating the social lifestyle"
      );
    }
  }

  @Get()
  @ApiOperation({ summary: "Return all social lifestyles." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved social lifestyle.",
    isArray: true,
    examples: {
      "application/json": {
        summary: "Social lifestyles DTO array",
        value: {
          data: [
            {
              id: 1,
              cityId: 1,
              yearId: 1,
              avg_price: 200,
              currency: "EUR",
              type: "SOLO",
              created_at: "2025-03-26T19:50:30.809Z",
            },
            {
              id: 2,
              cityId: 2,
              yearId: 1,
              avg_price: 200,
              currency: "EUR",
              type: "SOLO",
              created_at: "2025-03-26T19:50:30.809Z",
            },
          ],
          total: 100,
          limit: 10,
          page: 1,
        },
      },
    },
  })
  async getAll(@Query() query: SocialLifestyleQueryDto) {
    try {
      return await this.socialLifestyleService.getAll(query);
    } catch (error: any) {
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all the social lifestyles"
      );
    }
  }

  @Get(":id")
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Return social lifestyle by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved social lifestyle by id.",
    type: SocialLifestyleDto,
    examples: {
      "application/json": {
        summary: "Social Lifestyle DTO",
        value: {
          id: 1,
          cityId: 1,
          yearId: 1,
          avg_price: 200,
          currency: "EUR",
          type: "SOLO",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async getById(@Param("id") id: string) {
    try {
      return await this.socialLifestyleService.getById(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while fetching the social lifestyle with id: ${id}`
      );
    }
  }

  @Put()
  @UseGuards()
  @UsePipes(
    StaticFieldValidationPipe,
    ForeignKeyValidationPipe,
    ExistenceValidationPipe
  )
  @ApiOperation({ summary: "Update social lifestyle" })
  @ApiResponse({
    status: 200,
    description: "Successfully updated social lifestyle.",
    isArray: true,
    type: SocialLifestyleDto,
    examples: {
      multiple: {
        summary: "Multiple updated social lifestyle",
        value: [
          {
            id: 1,
            cityId: 1,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            cityId: 2,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  @ApiBody({
    description: "The data to update social lifestyle",
    type: CreateSocialLifestyleDto,
    examples: {
      multiple: {
        value: [
          {
            id: 1,
            cityId: 1,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
          {
            id: 2,
            cityId: 2,
            yearId: 1,
            avg_price: 200,
            currency: "EUR",
            type: "SOLO",
            created_at: "2025-03-26T19:50:30.809Z",
          },
        ],
      },
    },
  })
  async update(@Body() data: SocialLifestyleDto[]) {
    try {
      if (Array.isArray(data)) {
        return await this.socialLifestyleService.updateMany(data);
      } else {
        throw new UnprocessableEntityException(
          "When you update multiple social lifestyles you need to provide array of SocialLifestyleDto."
        );
      }
    } catch (error: any) {
      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException(
        error.message ||
          "An error occurred while fetching all the social lifestyle"
      );
    }
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @UsePipes(UniqueExistenceValidation)
  @ApiOperation({ summary: "Delete social lifestyle by id." })
  @ApiResponse({
    status: 200,
    description: "Successfully deleted social lifestyle by id.",
    type: SocialLifestyleDto,
    examples: {
      "application/json": {
        summary: "Social Lifestyle DTO",
        value: {
          id: 1,
          cityId: 1,
          yearId: 1,
          avg_price: 200,
          currency: "EUR",
          type: "SOLO",
          created_at: "2025-03-26T19:50:30.809Z",
        },
      },
    },
  })
  async delete(@Param("id") id: string) {
    try {
      return await this.socialLifestyleService.delete(Number(id));
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `An error occurred while deleting the social lifestyle with id: ${id}`
      );
    }
  }
}
