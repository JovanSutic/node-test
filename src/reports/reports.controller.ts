import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UsePipes,
} from "@nestjs/common";

import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CognitoAuthGuard } from "../utils/auth.cognito.guard";
import { ReportsService } from "./reports.service";
import {
  ValidateCityIdPipe,
  ValidateReportStructurePipe,
} from "./reports.validation.pipe";
import type { ReportUserDataDto } from "./reports.dto";
import { UsersService } from "../users/users.service";

@Controller("reports")
@ApiTags("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService
  ) {}

  @Post()
  @UseGuards(CognitoAuthGuard)
  @UsePipes(ValidateReportStructurePipe, ValidateCityIdPipe)
  @ApiOperation({ summary: "Create the new report." })
  async create(@Body() reportUserData: ReportUserDataDto, @Req() req: any) {
    try {
      const userUuid = this.usersService.extractUserUuidFromRequest(req);
      return await this.reportsService.generatePrivateReport(
        reportUserData,
        userUuid
      );
    } catch (error: any) {
      throw error;
    }
  }

  @Post("public")
  @UsePipes(ValidateReportStructurePipe, ValidateCityIdPipe)
  @ApiOperation({ summary: "Generate short public report" })
  async createShort(@Body() reportUserData: ReportUserDataDto) {
    try {
      return await this.reportsService.generatePublicReport(reportUserData);
    } catch (error: any) {
      throw error;
    }
  }

  @Get()
  @UseGuards(CognitoAuthGuard)
  @ApiOperation({ summary: "Get all reports for the authenticated user" })
  async getAllByUser(@Req() req: any) {
    try {
      const userUuid = this.usersService.extractUserUuidFromRequest(req);
      return await this.reportsService.getAllByUser(userUuid);
    } catch (error) {
      throw error;
    }
  }

  @Get(":id")
  @UseGuards(CognitoAuthGuard)
  @ApiOperation({ summary: "Get report by id" })
  async getById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    try {
      const userUuid = this.usersService.extractUserUuidFromRequest(req);
      return await this.reportsService.getById(id, userUuid);
    } catch (error) {
      throw error;
    }
  }
}
