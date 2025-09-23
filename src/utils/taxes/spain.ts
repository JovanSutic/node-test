import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type {
  Allowance,
  Dependents,
  SpainOption,
  TaxBracket,
} from "../../types/flow.types";
import { calculateFederalIncomeTax, getProgressiveTax } from "../saveFlow";
import {
  regionalTaxBrackets,
  regionsSpain,
  socialBrackets,
  spanishTaxBrackets,
} from "../taxData";
import { spainConfig, type TaxConfig } from "./taxRules";

function getSpainRegionalBracket(cityId: number) {
  const region = regionsSpain[cityId.toString()];
  if (!region) {
    throw new Error("Provided city does not have the proper region");
  }

  return regionalTaxBrackets[region.region];
}

function extractKidsAllowance(config: TaxConfig) {
  const kidsAllowance: number[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (key.startsWith("dependentKid")) {
      if (typeof value === "number") {
        kidsAllowance.push(value);
      }
    }
  });

  for (let i = kidsAllowance.length; i < 10; i++) {
    if (kidsAllowance[i] === undefined) {
      kidsAllowance.push(kidsAllowance[i - 1]);
    }
  }

  return kidsAllowance;
}

function calculateAllowance(
  data: Dependents[],
  addition: number,
  config: TaxConfig
) {
  const result: Allowance[] = [];
  if (config.allowAllowance) {
    if (config.allowKidsAllowance) {
      data
        .filter((item) => item.type === "kid")
        .forEach((item) => {
          if (item.isDependent) {
            const amount = extractKidsAllowance(config);
            const index = result.filter((item) => item.type === "kid").length;
            result.push({ type: "kid", amount: amount[index] });
          }
        });
    }

    if (config.allowExtraKidAllowance) {
      data
        .filter((item) => item.type === "kid")
        .forEach((item) => {
          if (item.isDependent) {
            if (
              (item.age || config.extraKidAllowanceLimit + 1) + addition <
              config.extraKidAllowanceLimit
            ) {
              result.push({
                type: "kid-extra",
                amount: config.extraKidAllowance,
              });
            }
          }
        });
    }

    if (config.allowSpouseAllowance) {
      data
        .filter((item) => item.type === "spouse")
        .forEach((item) => {
          if (item.isDependent) {
            result.push({
              type: "spouse",
              amount: config.dependentSpouseAllowance,
            });
          }
        });
    }
  }

  return result;
}

function distributeAllowance(
  incomes: PersonalIncomesDto[],
  allowances: Allowance[]
) {
  if (incomes.length === 1) {
    return [...allowances].map((item) => ({ ...item, incomeIndex: 0 }));
  } else {
    const allowanceResult = [];
    const [income1, income2] = incomes;
    let incomePerson1 = income1.income;
    let incomePerson2 = income2.income;

    for (let index = 0; index < allowances.length; index++) {
      const element = allowances[index];
      if (incomePerson1 > incomePerson2) {
        allowanceResult.push({ ...element, incomeIndex: 0 });
        incomePerson1 = incomePerson1 - element.amount;
      } else {
        allowanceResult.push({ ...element, incomeIndex: 1 });
        incomePerson2 = incomePerson2 - element.amount;
      }
    }

    return allowanceResult;
  }
}

function calculateSocialBase(
  income: PersonalIncomesDto,
  socialBaseType: string,
  rate: number
) {
  if (socialBaseType === "incomeMinusAllExpenses") {
    return (
      ((income.income - (income.expensesCost + income.accountantCost)) * rate) /
      12
    );
  }

  return 0;
}

const calculateSocials = (
  incomes: PersonalIncomesDto[],
  config: TaxConfig,
  year: number
) => {
  const result = [];

  for (let index = 0; index < incomes.length; index++) {
    if (config.allowSocialDiscount && year < config.socialDiscountLength) {
      result.push(config.socialDiscountedAmount);
    } else {
      const base = calculateSocialBase(
        incomes[index],
        config.socialBaseType,
        config.socialBaseRateIndex
      );
      if (config.socialTaxType === "progressive") {
        const bracket = socialBrackets.find((item) => {
          if (base > item.from && base < item.to) {
            return item;
          }
        });

        result.push((bracket?.fee || 1) * 12);
      } else {
        result.push(base * config.socialRate);
      }
    }
  }

  return result;
};

function getMaternityCredit(
  reportUserData: ReportUserDataDto,
  addition: number,
  config: TaxConfig
) {
  const isBaby = reportUserData.dependents.find(
    (item) =>
      (item.age || config.extraKidAllowanceLimit + 1) + addition <
        config.extraKidAllowanceLimit && item.type === "kid"
  );
  if (isBaby && reportUserData.isWorkingMom) {
    return config.workingMomCredit;
  }

  return 0;
}

function getReductions(base: number, year: number, config: TaxConfig) {
  const result = {
    newSelfEmployedReduction: 0,
    assumedCostReduction: 0,
    taxableIncome: 0,
  };
  let statefulBase = base;

  const sequence = config.taxableIncomeSequence.split(",");

  const newReduction =
    year < config.newCompanyReductionLength ? config.newCompanyReduction : 0;

  sequence.forEach((item) => {
    if (
      item === "allowNewCompanyReduction" &&
      config.allowNewCompanyReduction
    ) {
      const reduction = Math.min(
        statefulBase * newReduction,
        config.newCompanyMaxReduction
      );
      result.newSelfEmployedReduction = reduction;
      statefulBase = statefulBase - reduction;
    }
    if (
      item === "allowAssumedCostReduction" &&
      config.allowAssumedCostReduction
    ) {
      const reduction = Math.min(
        statefulBase * config.assumedCostReduction,
        config.assumedCostMaxReduction
      );
      result.assumedCostReduction = reduction;
      statefulBase = statefulBase - reduction;
    }
  });

  result.taxableIncome = statefulBase;

  return result;
}

function getStateTax(
  taxableIncome: number,
  totalAllowance: number,
  isStateTax: boolean
) {
  if (isStateTax) {
    const stateTax = getProgressiveTax(taxableIncome, spanishTaxBrackets);
    const stateAllowanceTax = getProgressiveTax(
      totalAllowance,
      spanishTaxBrackets
    );

    return {
      tax: stateTax.totalTax - stateAllowanceTax.totalTax,
      allowanceTax: stateAllowanceTax.totalTax,
    };
  }

  return {
    tax: 0,
    allowanceTax: 0,
  };
}

function getRegionalTax(
  taxableIncome: number,
  totalAllowance: number,
  regionalBrackets: TaxBracket[]
) {
  const regionalTax = getProgressiveTax(taxableIncome, regionalBrackets);

  const regionalAllowanceTax = getProgressiveTax(
    totalAllowance,
    regionalBrackets
  );

  return {
    tax: regionalTax.totalTax - regionalAllowanceTax.totalTax,
    allowanceTax: regionalAllowanceTax.totalTax,
  };
}

const calculateSpainTaxSingle = (
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  config: TaxConfig
) => {
  const reportItems: CreateReportItemDto[] = [];
  const kidAddition: Record<SpainOption, number> = {
    "1st": 0,
    "2nd": 1,
    "3rd": 2,
  };

  const additionalAllowance = calculateAllowance(
    reportUserData.dependents,
    kidAddition[scenario],
    config
  );

  const allowances = distributeAllowance(
    reportUserData.incomes,
    additionalAllowance
  );

  const maternityCredit = config.allowWorkingMomCredit
    ? getMaternityCredit(reportUserData, kidAddition[scenario], config)
    : 0;

  const socials = calculateSocials(
    reportUserData.incomes,
    config,
    kidAddition[scenario]
  );

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];
    const expenses = income.accountantCost + income.expensesCost;
    const net = income.income - expenses - socials[index];

    const { newSelfEmployedReduction, assumedCostReduction, taxableIncome } =
      getReductions(net, kidAddition[scenario], config);

    const totalAllowance =
      config.personalAllowance +
      (config.allowAllowance
        ? allowances
            .filter((item) => item.incomeIndex === index)
            .reduce((prev, next) => prev + next.amount, 0)
        : 0);

    const soleRegions = ["Navarre", "Basque Country"];
    const region = regionsSpain[reportUserData.cityId.toString()]?.region;
    const regionalBrackets = getSpainRegionalBracket(reportUserData.cityId);

    const { tax: stateTaxFull, allowanceTax: stateAllowanceTax } = getStateTax(
      taxableIncome,
      totalAllowance,
      !soleRegions.includes(region)
    );

    const { tax: regionalTaxFull, allowanceTax: regionalAllowanceTax } =
      getRegionalTax(taxableIncome, totalAllowance, regionalBrackets);

    const taxCredit = maternityCredit;

    const netIncome = net - stateTaxFull - regionalTaxFull + taxCredit;

    const federalTax = calculateFederalIncomeTax({
      income: income.income,
      taxPaidAbroad: stateTaxFull + regionalTaxFull - taxCredit,
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
        amount: socials[index],
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
        amount: regionalTaxFull + stateTaxFull - taxCredit,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Effective tax",
        type: "effective_tax",
        amount:
          (regionalTaxFull + socials[index] + stateTaxFull - taxCredit) /
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

      if (income.isUSCitizen && socials[index]) {
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
        amount: socials[index] + regionalTaxFull + stateTaxFull - taxCredit,
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
  eurRate: number
) => {
  const first = calculateSpainTaxSingle(
    reportUserData,
    eurRate,
    "1st",
    spainConfig
  );
  const second = calculateSpainTaxSingle(
    reportUserData,
    eurRate,
    "2nd",
    spainConfig
  );
  const third = calculateSpainTaxSingle(
    reportUserData,
    eurRate,
    "3rd",
    spainConfig
  );

  return [...first, ...second, ...third];
};
