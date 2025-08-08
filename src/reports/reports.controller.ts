import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Req,
  BadRequestException,
  UsePipes,
} from "@nestjs/common";

import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CognitoAuthGuard } from "../utils/auth.cognito.guard";
import { ReportsService } from "./reports.service";
import { JwtService } from "@nestjs/jwt";
import { ValidateCityIdPipe, ValidateReportStructurePipe } from "./reports.validation.pipe";
import type { ReportUserDataDto } from "./reports.dto";

@Controller("reports")
@ApiTags("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly jwtService: JwtService
  ) {}

  @Post()
  @UseGuards(CognitoAuthGuard)
  @UsePipes(ValidateReportStructurePipe, ValidateCityIdPipe)
  @ApiOperation({ summary: "Create the new report." })
  async create(@Body() reportUserData: ReportUserDataDto, @Req() req: any) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    let userUuid = "";

    try {
      const decoded = this.jwtService.decode(token) as any;
      userUuid = decoded?.sub;
    } catch (error) {
      throw new BadRequestException("Invalid token");
    }

    if(!userUuid) {
      throw new BadRequestException("No sub in the token");
    }

    try {
      return await this.reportsService.generatePrivateReport(reportUserData, userUuid);
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

  @Get(":id")
  @UseGuards(CognitoAuthGuard)
  @ApiOperation({ summary: "Get report by id" })
  async getById(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    let userUuid = "";

    try {
      const decoded = this.jwtService.decode(token) as any;
      userUuid = decoded?.sub;
    } catch (error) {
      throw new BadRequestException("Invalid token");
    }

    if(!userUuid) {
      throw new BadRequestException("No sub in the token");
    }

    return this.reportsService.getById(id, userUuid);
  }
}
