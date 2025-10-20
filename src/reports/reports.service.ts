import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CitiesService } from "../cities/cities.service";
import { CurrenciesService } from "../helpers/currency.service";
import {
  calculateBudget,
  convertUserData,
  decorateItems,
  getTaxCalculationFunction,
  getUserStructure,
  getValidPriceStructure,
} from "../utils/saveFlow";
import { PricesService } from "../prices/prices.service";
import { PriceDto, PriceType } from "../prices/prices.dto";
import { PrismaService } from "../prisma/prisma.service";
import type {
  CreateReportDto,
  CreateReportItemDto,
  PublicReportDto,
  ReportUserDataDto,
} from "./reports.dto";
import { SocialType } from "../social_lifestyle/social_lifestyle.dto";
import type { ExchangeRate } from "../types/flow.types";
import { DefValueService } from "../def_value/def_value.service";
import { processTaxConfigStrings } from "../utils/taxes/config";
import type { TaxConfig } from "../types/taxes.types";

interface ReportBudgets {
  comfortBudget: number;
  lowBudget: number;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly defValueService: DefValueService,
    private readonly currenciesService: CurrenciesService,
    private readonly pricesService: PricesService,
    private readonly prisma: PrismaService
  ) {}

  private async safeExecute<T>(
    fn: () => Promise<T>,
    errorMsg: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || errorMsg);
    }
  }

  async getReportItems(
    reportUserData: ReportUserDataDto,
    rates: ExchangeRate,
    config: TaxConfig
  ): Promise<any> {
    const normalizedData = convertUserData(reportUserData, rates);

    const city = await this.safeExecute(
      () => this.citiesService.getById(Number(reportUserData.cityId)),
      "An error occurred while fetching the city and country of the report"
    );

    if (!city) {
      throw new InternalServerErrorException(
        `Failed to fetch city with id: ${reportUserData.cityId}`
      );
    }

    const calculationFunction = getTaxCalculationFunction(city.country);
    if (!calculationFunction) {
      throw new InternalServerErrorException(
        "An error occurred while making calculation for the report"
      );
    }

    return calculationFunction(normalizedData, rates.usd, city.country, config);
  }

  async getBudgets(reportUserData: ReportUserDataDto): Promise<ReportBudgets> {
    let prices = null;
    try {
      prices = await this.pricesService.getAll({
        cityId: reportUserData.cityId,
        yearId: 16,
        priceType: PriceType.CURRENT,
        currency: "EUR",
        limit: 60,
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message ||
          "An error occurred while making calculation for the report"
      );
    }

    const { kidsNum, adultNum } = getUserStructure(reportUserData);
    const { comfortStructure, lowStructure } = getValidPriceStructure(
      kidsNum,
      adultNum
    );

    const comfortBudget =
      calculateBudget(comfortStructure, prices.data as PriceDto[]) * 12;
    const lowBudget =
      calculateBudget(lowStructure, prices.data as PriceDto[]) * 12;

    return {
      comfortBudget,
      lowBudget,
    };
  }

  async create(createReportCto: CreateReportDto) {
    const today = new Date();
    const {
      userUuid,
      cityId,
      net,
      save,
      expensesLow,
      expensesComfort,
      type,
      userData,
    } = createReportCto;

    try {
      return await this.prisma.report.create({
        data: {
          userUuid,
          cityId,
          net,
          save,
          expensesLow,
          expensesComfort,
          type,
          userData,
          createdAt: today,
        },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message ||
          "An error occurred while creating the report in the database"
      );
    }
  }

  async createItems(reportItems: CreateReportItemDto[], reportId: number) {
    try {
      return await this.prisma.report_items.createMany({
        data: reportItems.map((item) => ({
          reportId,
          incomeMaker: item.incomeMaker,
          label: item.label,
          type: item.type,
          amount: item.amount,
          note: item.note,
        })),
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message ||
          "An error occurred while creating the report items in the database"
      );
    }
  }

  async getById(id: number, userUuid: string) {
    try {
      const report = await this.prisma.report.findUnique({
        where: { id, userUuid },
        include: {
          costItems: true,
          city: {
            select: {
              name: true,
              country: true,
              countriesId: true,
            },
          },
        },
      });
      return report || {};
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || `Error while fetching report with id: ${id}`
      );
    }
  }

  async getAllByUser(userUuid: string) {
    try {
      return await this.prisma.report.findMany({
        where: { userUuid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          cityId: true,
          userData: true,
          net: true,
          city: {
            select: { name: true, country: true },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getCountryTaxConfig(cityId: number) {
    const city = await this.safeExecute(
      () => this.citiesService.getById(cityId),
      "An error occurred while fetching the city and country of the report"
    );

    if (!city) {
      throw new InternalServerErrorException(
        `Failed to fetch city with id: ${cityId}`
      );
    }

    const defValues = await this.safeExecute(
      () => this.defValueService.getConfigTaxRulesByCountry(city.countriesId!),
      "An error occurred while fetching the city and country of the report"
    );

    if (!defValues || !defValues.length) {
      throw new InternalServerErrorException(
        `Failed to fetch tax rules and country config for city with id: ${cityId}`
      );
    }

    const configArr = processTaxConfigStrings(defValues);

    return configArr;
  }

  async generatePublicReport(reportUserData: ReportUserDataDto) {
    const { kidsNum, adultNum } = getUserStructure(reportUserData);
    const socialType =
      kidsNum > 0
        ? SocialType.FAMILY
        : adultNum === 2
        ? SocialType.PAIR
        : SocialType.SOLO;

    const rates = await this.safeExecute(
      () => this.currenciesService.fetchRate(),
      "Failed to fetch currencies"
    );

    const config = await this.safeExecute(
      () => this.getCountryTaxConfig(Number(reportUserData.cityId)),
      "Failed to fetch currencies"
    );

    const reportItems = await this.safeExecute<CreateReportItemDto[]>(
      () => this.getReportItems(reportUserData, rates, config),
      "Failed to generate report items"
    );

    const budgets = await this.safeExecute(
      () => this.getBudgets(reportUserData),
      "Failed to calculate budget data"
    );

    const netAmount =
      reportItems
        .filter((item) => item.type === "net")
        ?.reduce((prev, next) => prev + next.amount, 0) || 0;
    const createReportDto: PublicReportDto = {
      cityId: reportUserData.cityId,
      net: netAmount,
      save: netAmount - budgets.comfortBudget,
      expensesLow: budgets.lowBudget || 0,
      expensesComfort: budgets.comfortBudget,
      type: socialType,
      userData: { ...reportUserData, rates },
      costItems: decorateItems(reportItems),
    };

    return createReportDto;
  }

  // async generatePrivateReport(
  //   reportUserData: ReportUserDataDto,
  //   userUuid: string
  // ) {
  //   const { kidsNum, adultNum } = getUserStructure(reportUserData);
  //   const socialType =
  //     kidsNum > 0
  //       ? SocialType.FAMILY
  //       : adultNum === 2
  //       ? SocialType.PAIR
  //       : SocialType.SOLO;

  //   const rates = await this.safeExecute(
  //     () => this.currenciesService.fetchRate(),
  //     "Failed to fetch currencies"
  //   );

  //   const reportItems = await this.safeExecute<CreateReportItemDto[]>(
  //     () => this.getReportItems(reportUserData, rates),
  //     "Failed to generate report items"
  //   );

  //   const budgets = await this.safeExecute(
  //     () => this.getBudgets(reportUserData),
  //     "Failed to calculate budget data"
  //   );

  //   const netAmount =
  //     reportItems
  //       .filter((item) => item.type === "net")
  //       ?.reduce((prev, next) => prev + next.amount, 0) || 0;
  //   const createReportDto: CreateReportDto = {
  //     userUuid,
  //     cityId: reportUserData.cityId,
  //     net: netAmount,
  //     save: netAmount - budgets.comfortBudget,
  //     expensesLow: budgets.lowBudget || 0,
  //     expensesComfort: budgets.comfortBudget,
  //     type: socialType,
  //     userData: { ...reportUserData, rates },
  //   };

  //   const report = await this.safeExecute(
  //     () => this.create(createReportDto),
  //     "Failed to save report"
  //   );

  //   await this.safeExecute(
  //     () => this.createItems(reportItems, report.id),
  //     "Failed to save report items"
  //   );

  //   return await this.safeExecute(
  //     () => this.getById(report.id, userUuid),
  //     "Failed to retrieve final report"
  //   );
  // }
}
