import type {
  CreateReportItemDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type {
  SpainOption,
} from "../../types/flow.types";
import type {
  TaxConfig,
} from "../../types/taxes.types";
import { calculateFederalIncomeTax } from "../saveFlow";
import { calculateAllowance, distributeAllowance } from "./allowance";
import { getConfig, getConfigRegime } from "./config";
import { getTaxCredits } from "./credit";
import { calculateSocials, getJoinTaxableIncome, getReductions } from "./socialsAndReduction";
import {
  getRegionalBrackets,
  getRegionalTax,
  getSoleRegionMatch,
  getStateBrackets,
  getStateTax,
} from "./tax";


const calculateTaxSingle = (
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  config: TaxConfig,
  country: string
) => {
  const reportItems: CreateReportItemDto[] = [];
  const kidAddition: Record<SpainOption, number> = {
    "1st": 0,
    "2nd": 1,
    "3rd": 2,
  };

  const isForJoint =
    reportUserData.incomes.length === 2 && config.extras.jointFilingBenefits;

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];

    const regime = getConfigRegime(config, income);

    if (regime === null) {
      throw new Error("Regime was not found");
    }

    const additionalAllowance = calculateAllowance(
      reportUserData.dependents,
      kidAddition[scenario],
      regime.rules
    );

    const allowances = distributeAllowance(
      reportUserData.incomes,
      additionalAllowance
    );

    const socials = calculateSocials(
      [income],
      regime.rules,
      kidAddition[scenario],
      reportUserData.dependents,
    );

    const expenses = income.accountantCost + income.expensesCost;

    const { newSelfEmployedReduction, assumedCostReduction, taxableIncome } =
      isForJoint
        ? getJoinTaxableIncome(reportUserData, config, kidAddition[scenario])
        : getReductions(
            {
              gross: income.income,
              expenses,
              socials: socials[0],
              kids: reportUserData.dependents.filter(
                (item) => item.type === "kid"
              ).length,
            },
            { age: income.age || 50 },
            kidAddition[scenario],
            regime.rules
          );

    const totalAllowance =
      regime.rules.allowance.personal +
      (regime.rules.allowance.allow
        ? allowances
            .filter((item) => item.incomeIndex === index)
            .reduce((prev, next) => prev + next.amount, 0)
        : 0);

    const isExclusiveRegion = regime.rules.tax.regionalExclusivity
      ? getSoleRegionMatch(country, reportUserData.cityId)
      : false;
    const regionalBrackets = regime.rules.tax.level
      .split(",")
      .includes("regional")
      ? getRegionalBrackets(country, reportUserData.cityId)
      : [];

    const stateBrackets = getStateBrackets(country, reportUserData.cityId);

    const { tax: stateTaxFull, allowanceTax: stateAllowanceTax } = getStateTax({
      taxableIncome,
      totalAllowance,
      isStateTax: !isExclusiveRegion,
      brackets: stateBrackets,
      rate: regime.rules.tax.rate,
      type: regime.rules.tax.type,
    });

    const { tax: regionalTaxFull, allowanceTax: regionalAllowanceTax } =
      getRegionalTax(taxableIncome, totalAllowance, regionalBrackets);

    const municipalTax = regime.rules.tax.other?.municipal
      ? taxableIncome * regime.rules.tax.other.municipal
      : 0;

    const taxCredit =
      getTaxCredits(
        regime.rules,
        reportUserData,
        kidAddition[scenario],
        taxableIncome,
        isForJoint
      ) / reportUserData.incomes.length;

    const totalTax = municipalTax + stateTaxFull + regionalTaxFull - taxCredit;
    const net = income.income - expenses - socials[0];
    const netIncome = net - totalTax;

    const federalTax = calculateFederalIncomeTax({
      income: income.income,
      taxPaidAbroad: stateTaxFull + regionalTaxFull + municipalTax - taxCredit,
      eurRate,
    });

    if (scenario === "1st") {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Gross income normalized",
        type: "gross",
        amount: income.income,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Full business expenses",
        type: "expenses",
        amount: expenses,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "New self-employed reduction",
        type: "reduction",
        amount: newSelfEmployedReduction,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Reduction for expenses difficult to justify",
        type: "reduction",
        amount: assumedCostReduction,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Full allowance",
        type: "allowance",
        amount: totalAllowance,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Allowance tax credit",
        type: "tax_credit",
        amount: regionalAllowanceTax + stateAllowanceTax,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total social contributions",
        type: "social_contributions",
        amount: socials[0],
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Taxable income",
        type: "taxable_income",
        amount: taxableIncome,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "State income tax",
        type: "income_tax",
        amount: stateTaxFull,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Regional income tax",
        type: "income_tax",
        amount: regionalTaxFull,
      });

      if (taxCredit > 0) {
        reportItems.push({
          reportId: 0,
          incomeMaker: index,
          label: "Maternity tax credit",
          type: "tax_credit",
          amount: taxCredit,
        });
      }

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total income tax",
        type: "total_tax",
        amount: totalTax,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Effective tax",
        type: "effective_tax",
        amount:
          (regionalTaxFull + socials[0] + stateTaxFull - taxCredit) /
          reportUserData.incomes[index].income,
      });

      if (income.isUSCitizen) {
        reportItems.push({
          reportId: 0,
          incomeMaker: index,
          label: "US Federal income tax",
          type: "us_income_tax",
          amount: federalTax.amount,
          note: federalTax.comment,
        });
      }

      if (income.isUSCitizen && socials[0]) {
        reportItems.push({
          reportId: 0,
          incomeMaker: index,
          label: "US self employed tax",
          type: "us_self_tax",
          amount: 0,
          note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
        });
      }

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total net income",
        type: "net",
        amount: netIncome,
      });
    } else {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total tax",
        type: `additional_${scenario}`,
        amount: socials[0] + totalTax,
      });
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total net income",
        type: `additional_${scenario}`,
        amount: netIncome,
      });
    }
  }

  return reportItems;
};

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
