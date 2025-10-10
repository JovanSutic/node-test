import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { PrepReportItem, SpainOption } from "../../types/flow.types";
import type { TaxConfig } from "../../types/taxes.types";
import type {
  AdditionalTaxUnitContract,
  AllowanceUnitContract,
  FinalValuesUnitContract,
  HealthUnitContract,
  InitUnitContract,
  MunicipalTaxUnitContract,
  RegionalTaxUnitContract,
  ReportStoreValues,
  SalaryUnitContract,
  SocialUnitContract,
  StateTaxUnitContract,
  TaxableIncomeUnitContract,
  TaxCreditsUnitContract,
  USUnitContract,
} from "../../types/taxProcessing.types";
import { packageReportItems } from "../saveFlow";
import { getConfig, getConfigRegime } from "./config";
import {
  setAdditionalTax,
  setFinalValues,
  setInitialData,
  setMunicipalTax,
  setRegionalTax,
  setSalary,
  setSocials,
  setStateTax,
  setTaxableIncome,
  setTaxCredits,
  setTotalAllowance,
  setTotalHealth,
  setUsData,
  TaxService,
} from "./taxProcessing";

function prepReportItems(
  reportValues: ReportStoreValues,
  scenario: SpainOption,
  index: number
) {
  const prepItems: PrepReportItem[] =
    scenario === "1st"
      ? [
          {
            label: "Gross income normalized",
            type: "gross",
            amount: reportValues.grossIncome,
          },
          {
            label: "Allowance tax credit",
            type: "tax_credit",
            amount:
              reportValues.stateTaxAllowance +
              reportValues.regionalTaxAllowance,
          },
          {
            label: "Yearly salary",
            type: "gross_salary",
            amount: reportValues.minSalaryYear,
          },
          {
            label: "Yearly salary contributions",
            type: "salary_contributions",
            amount: reportValues.salaryContributions,
          },
          {
            label: "Full allowance",
            type: "allowance",
            amount: reportValues.totalAllowance,
          },
          {
            label: "Reduction for expenses difficult to justify",
            type: "reduction",
            amount: reportValues.assumedCostReduction,
          },
          {
            label: "Full business expenses",
            type: "expenses",
            amount: reportValues.totalExpenses,
          },
          {
            label: "Total social contributions",
            type: "social_contributions",
            amount: reportValues.socials,
          },
          {
            label: "Health Insurance",
            type: "health_insurance",
            amount: reportValues.totalHealth,
          },
          {
            label: "Taxable income",
            type: "taxable_income",
            amount: reportValues.taxableIncome,
          },
          {
            label: "State income tax",
            type: "income_tax",
            amount: reportValues.stateTax,
          },
          {
            label: "Municipal income tax",
            type: "income_tax",
            amount: reportValues.municipalTax,
          },
          {
            label: "Total income tax",
            type: "total_tax",
            amount: reportValues.totalTax,
          },
          {
            label: "Total tax credit",
            type: "tax_credit",
            amount: reportValues.taxCredit,
          },
          {
            label: "Effective tax",
            type: "effective_tax",
            amount: reportValues.effectiveTaxRate,
          },
          ...(reportValues.federalTax
            ? [
                {
                  label: "US Federal income tax",
                  type: "us_income_tax",
                  amount: reportValues.federalTax.amount,
                  note: reportValues.federalTax.comment,
                },
              ]
            : []),
          ...(reportValues.usSelfEmployedTaxNote
            ? [
                {
                  label: "US self employed tax",
                  type: "us_self_tax",
                  amount: 0,
                  note: reportValues.usSelfEmployedTaxNote.comment,
                },
              ]
            : []),
          {
            label: "Total net income",
            type: "net",
            amount: reportValues.netIncome,
          },
          {
            label: "Progressive tax Czech Regime",
            type: "tax_type",
            amount: 0,
            note: "Osoba Samostatně Výdělečně Činná - Individually Earning Person",
          },
        ]
      : [
          {
            label: "Total tax",
            type: `additional_${scenario}`,
            amount:
              reportValues.totalTax +
              reportValues.socials +
              reportValues.totalHealth,
          },
          {
            label: "Total net income",
            type: `additional_${scenario}`,
            amount: reportValues.netIncome,
          },
        ];

  return packageReportItems(prepItems, index);
}

function mergeIncomes(incomes: PersonalIncomesDto[]) {
  let result: PersonalIncomesDto | undefined = undefined;
  incomes.forEach((item) => {
    if (!result) {
      result = { ...item };
    } else {
      result.income = result.income + item.income;
      result.expensesCost = result.expensesCost + item.expensesCost;
    }
  });

  return result ? [result] : [];
}

function calculateTaxSingle(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  config: TaxConfig,
  country: string
) {
  const reportItems: CreateReportItemDto[] = [];
  const kidAddition: Record<SpainOption, number> = {
    "1st": 0,
    "2nd": 1,
    "3rd": 2,
  };

  const isForJoint =
    reportUserData.incomes.length === 2 && config.extras.jointFilingBenefits;
  const isForJointCalc =
    reportUserData.incomes.length === 2 && config.extras.jointCalculation;
  const userIncomes = isForJointCalc
    ? mergeIncomes(reportUserData.incomes)
    : reportUserData.incomes;

  for (let index = 0; index < userIncomes.length; index++) {
    const income = userIncomes[index];
    const regime = getConfigRegime(
      config,
      income,
      isForJointCalc ? 2 : userIncomes.length
    );

    if (regime === null) {
      throw new Error("Regime was not found");
    }
    const taxService = new TaxService();

    const initialUnit: InitUnitContract = {
      grossIncome: income.income,
      totalExpenses: income.accountantCost + income.expensesCost,
    };
    setInitialData(taxService.forInit(), initialUnit);

    const salaryUnit: SalaryUnitContract = {
      rules: regime.rules,
      country,
    };
    setSalary(taxService.forSalary(), salaryUnit);

    const socialUnit: SocialUnitContract = {
      age: income.age || 50,
      rules: regime.rules,
      year: kidAddition[scenario],
      dependents: reportUserData.dependents,
    };
    setSocials(taxService.forSocials(), socialUnit);

    const taxableIncomeUnit: TaxableIncomeUnitContract = {
      age: income.age || 50,
      rules: regime.rules,
      year: kidAddition[scenario],
      kids: reportUserData.dependents.filter((item) => item.type === "kid")
        .length,
      isForJoint,
      reportUserData,
      config,
    };
    setTaxableIncome(taxService.forTaxableIncome(), taxableIncomeUnit);

    const totalAllowanceUnit: AllowanceUnitContract = {
      index,
      rules: regime.rules,
      year: kidAddition[scenario],
      reportUserData,
    };
    setTotalAllowance(taxService.forAllowance(), totalAllowanceUnit);

    const stateTaxUnit: StateTaxUnitContract = {
      rules: regime.rules,
      country,
      cityId: reportUserData.cityId,
    };
    setStateTax(taxService.forStateTax(), stateTaxUnit);

    const regionalTaxUnit: RegionalTaxUnitContract = {
      rules: regime.rules,
      country,
      cityId: reportUserData.cityId,
    };
    setRegionalTax(taxService.forRegionalTax(), regionalTaxUnit);

    const municipalTaxUnit: MunicipalTaxUnitContract = {
      rules: regime.rules,
    };
    setMunicipalTax(taxService.forMunicipalTax(), municipalTaxUnit);

    const additionalTaxUnit: AdditionalTaxUnitContract = {
      rules: regime.rules,
      dependents: reportUserData.dependents.length,
      age: income.age || 50,
    };
    setAdditionalTax(taxService.forAdditionalTax(), additionalTaxUnit);

    const taxCreditUnit: TaxCreditsUnitContract = {
      rules: regime.rules,
      reportUserData,
      year: kidAddition[scenario],
      incomesLength: reportUserData.incomes.length,
      isForJoint,
    };
    setTaxCredits(taxService.forTaxCredit(), taxCreditUnit);

    const totalHealthUnit: HealthUnitContract = {
      rules: regime.rules,
      age: income.age || 50,
    };
    setTotalHealth(taxService.forTotalHealth(), totalHealthUnit);

    const finalValuesUnit: FinalValuesUnitContract = {
      rules: regime.rules,
    };
    setFinalValues(taxService.forFinalValues(), finalValuesUnit);

    const usDataUnit: USUnitContract = {
      isUSCitizen: income.isUSCitizen,
      eurRate,
    };
    setUsData(taxService.forUSData(), usDataUnit);

    const { getReportItemValues } = taxService.forReportItems();

    const items = prepReportItems(getReportItemValues(), scenario, index);
    reportItems.push(...items);
  }

  return reportItems;
}

export const calculateSpainTax = (
  reportUserData: ReportUserDataDto,
  eurRate: number,
  country: string
) => {
  const config = getConfig(country);
  if (config) {
    const result = [];
    const projections: SpainOption[] = ["1st", "2nd", "3rd"];

    for (let index = 0; index < projections.length; index++) {
      const projection = projections[index];
      const taxesList = calculateTaxSingle(
        reportUserData,
        eurRate,
        projection,
        config,
        country
      );

      result.push(...taxesList);
    }
    return result;
  }

  return [];
};
