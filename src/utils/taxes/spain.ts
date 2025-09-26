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
  getPortugalBrackets,
  regionalTaxBrackets,
  regionsSpain,
  socialBrackets,
  spanishTaxBrackets,
} from "../taxData";
import { getJovemExemptionRate } from "./portugal";
import {
  spainConfig,
  portugalConfig,
  type TaxRules,
  type TaxConfig,
  type TaxConditions,
} from "./taxRules";

function getConfig(country: string) {
  if (country === "Spain") return spainConfig;
  if (country === "Portugal") return portugalConfig;

  return null;
}

function getMatchedConditionNumber(
  income: PersonalIncomesDto,
  conditions: TaxConditions[]
) {
  let result = 0;

  for (let index = 0; index < conditions.length; index++) {
    const element = conditions[index];
    const subject =
      (income[element.subject as keyof PersonalIncomesDto] as number) ||
      income.accountantCost + income.expensesCost;
    const object =
      element.conditionType === "number"
        ? element.condition
        : (income[element.object as keyof PersonalIncomesDto] as number) *
          element.condition;

    if (element.operation === "LESS THAN") {
      if (subject < object) {
        result++;
        continue;
      }
    }

    if (element.operation === "MORE THAN") {
      if (subject > object) {
        result++;
        continue;
      }
    }

    if (element.operation === "EQUALS") {
      if (subject === object) {
        result++;
        continue;
      }
    }
  }

  return result;
}

function getConfigRegime(config: TaxConfig, income: PersonalIncomesDto) {
  if (config.regimes.length === 1) {
    return config.regimes[0];
  }
  let result = null;

  for (let index = 0; index < config.regimes.length; index++) {
    const regime = config.regimes[index];
    const conditionAssertion =
      regime.conditions.type === "AND" ? regime.conditions.list.length : 1;
    const matchedConditions = getMatchedConditionNumber(
      income,
      regime.conditions.list
    );

    if (matchedConditions >= conditionAssertion) {
      result = regime;
      break;
    }
  }

  return result;
}

function getSoleRegionMatch(country: string, cityId: number) {
  if (country === "Spain") {
    const soleRegions = ["Navarre", "Basque Country"];
    const region = regionsSpain[cityId.toString()]?.region;
    return soleRegions.includes(region);
  }

  false;
}

function getStateBrackets(country: string, cityId: number) {
  if (country === "Spain") return spanishTaxBrackets;
  if (country === "Portugal") return getPortugalBrackets(cityId);

  return [];
}

function getRegionalBrackets(country: string, cityId: number) {
  if (country === "Spain") return getSpainRegionalBracket(cityId);

  return [];
}

function getAgeReduction(
  age: number,
  base: number,
  year: number,
  config: TaxRules
) {
  const exemptionRate = getJovemExemptionRate(year);

  if (age <= config.ageLimit) {
    return Math.min(config.ageReductionCap, base * exemptionRate);
  }

  return 0;
}

function getSpainRegionalBracket(cityId: number) {
  const region = regionsSpain[cityId.toString()];
  if (!region) {
    throw new Error("Provided city does not have the proper region");
  }

  return regionalTaxBrackets[region.region];
}

function extractKidsAllowance(config: TaxRules) {
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
  config: TaxRules
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

function calculateSocialBase(income: PersonalIncomesDto, config: TaxRules) {
  if (config.socialBaseType === "incomeMinusAllExpenses") {
    return (
      ((income.income - (income.expensesCost + income.accountantCost)) *
        config.socialBaseRateIndex) /
      12
    );
  }
  if (config.socialBaseType === "income") {
    return income.income * config.socialBaseRateIndex;
  }

  return 0;
}

const calculateSocials = (
  incomes: PersonalIncomesDto[],
  config: TaxRules,
  year: number
) => {
  const result = [];

  for (let index = 0; index < incomes.length; index++) {
    if (config.allowSocialDiscount && year < config.socialDiscountLength) {
      result.push(config.socialDiscountedAmount);
    } else {
      const base = calculateSocialBase(incomes[index], config);
      if (config.socialTaxType === "progressive") {
        const bracket = socialBrackets.find((item) => {
          if (base > item.from && base < item.to) {
            return item;
          }
        });

        result.push((bracket?.fee || 1) * 12);
      } else {
        const social = base * config.socialRate;
        result.push(Math.min(config.socialMaxCap, social));
      }
    }
  }

  return result;
};

function getMaternityCredit(
  reportUserData: ReportUserDataDto,
  addition: number,
  config: TaxRules
) {
  if (config.workingMomCredit === 0) return 0;
  const isBaby = reportUserData.dependents.find(
    (item) =>
      (item.age || config.extraKidAllowanceLimit + 1) + addition <
        config.extraKidAllowanceLimit && item.type === "kid"
  );
  if (isBaby) {
    return config.workingMomCredit;
  }

  return 0;
}

function calculateCreditCap(
  config: TaxRules,
  taxableBase: number,
  isJoint: boolean
) {
  const limit = isJoint
    ? config.creditIncomeLimitJoint
    : config.creditIncomeLimit;
  const decrease = isJoint
    ? config.creditCapDecreaseJoint
    : config.creditCapDecrease;
  const multiplier = isJoint
    ? config.creditCapMultiplierJoint
    : config.creditCapMultiplier;

  const creditsCap =
    taxableBase > limit
      ? config.creditCapForAboveLimit
      : config.creditCapForAboveLimit +
        multiplier * (1 - (taxableBase - decrease) / (limit - decrease));

  return creditsCap;
}

function getTaxCredits(
  config: TaxRules,
  reportUserData: ReportUserDataDto,
  year: number,
  taxableIncome: number,
  isJoint = false
) {
  const maternityCredit = getMaternityCredit(reportUserData, year, config);
  const dependentCredit =
    config.dependentCredit * reportUserData.dependents.length;

  const credit =
    maternityCredit +
    dependentCredit +
    config.householdCredit +
    config.healthAndEduCredit;
  const creditCap =
    config.creditCapType === "calculated"
      ? calculateCreditCap(config, taxableIncome, isJoint)
      : 10000000;

  return Math.min(creditCap, credit);
}

interface IncomeBasics {
  gross: number;
  expenses: number;
  socials: number;
}

interface TaxAdditions {
  age: number;
}

function getReductions(
  incomeBasics: IncomeBasics,
  additions: TaxAdditions,
  year: number,
  config: TaxRules
) {
  const result = {
    newSelfEmployedReduction: 0,
    assumedCostReduction: 0,
    taxableIncome: 0,
  };

  const { gross, expenses, socials } = incomeBasics;
  let statefulBase = gross;

  const sequence = config.taxableIncomeSequence.split(",");

  const newReduction =
    year < config.newCompanyReductionLength ? config.newCompanyReduction : 0;

  sequence.forEach((item) => {
    if (item === "expensesReduction" && config.allowOtherReductions) {
      statefulBase = statefulBase - expenses;
    }
    if (item === "socialsReduction" && config.allowOtherReductions) {
      statefulBase = statefulBase - socials;
    }
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
    if (item === "allowPersonalReduction" && config.allowOtherReductions) {
      const reduction = config.personalReduction;
      statefulBase = statefulBase - reduction;
    }
    if (item === "allowAgeReduction" && config.allowOtherReductions) {
      const reduction = getAgeReduction(additions.age, gross, year + 1, config);
      statefulBase = statefulBase - reduction;
    }
  });

  result.taxableIncome = statefulBase;

  return result;
}

function getJoinTaxableIncome(
  reportUserData: ReportUserDataDto,
  config: TaxConfig,
  year: number
) {
  let jointTaxableIncome = 0;
  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];
    const regime = getConfigRegime(config, income)!;
    const socials = calculateSocials([income], regime.rules, year);
    const incomeBasics = {
      gross: income.income,
      expenses: income.accountantCost + income.expensesCost,
      socials: socials[0],
    };
    const { taxableIncome } = getReductions(
      incomeBasics,
      { age: income.age || 50 },
      year,
      regime.rules
    );

    jointTaxableIncome = jointTaxableIncome + taxableIncome;
  }

  return {
    newSelfEmployedReduction: 0,
    assumedCostReduction: 0,
    taxableIncome: jointTaxableIncome / 2,
  };
}

function getStateTax(
  taxableIncome: number,
  totalAllowance: number,
  isStateTax: boolean,
  brackets: TaxBracket[]
) {
  if (isStateTax) {
    const stateTax = getProgressiveTax(taxableIncome, brackets);
    const stateAllowanceTax = getProgressiveTax(totalAllowance, brackets);

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
  if (regionalBrackets.length) {
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

  return {
    tax: 0,
    allowanceTax: 0,
  };
}

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
      kidAddition[scenario]
    );

    const expenses = income.accountantCost + income.expensesCost;

    const { newSelfEmployedReduction, assumedCostReduction, taxableIncome } =
      isForJoint
        ? getJoinTaxableIncome(reportUserData, config, kidAddition[scenario])
        : getReductions(
            { gross: income.income, expenses, socials: socials[0] },
            { age: income.age || 50 },
            kidAddition[scenario],
            regime.rules
          );

    const totalAllowance =
      regime.rules.personalAllowance +
      (regime.rules.allowAllowance
        ? allowances
            .filter((item) => item.incomeIndex === index)
            .reduce((prev, next) => prev + next.amount, 0)
        : 0);

    const isExclusiveRegion = regime.rules.incomeTaxRegionalExclusivity
      ? getSoleRegionMatch(country, reportUserData.cityId)
      : false;
    const regionalBrackets = regime.rules.incomeTaxLevels
      .split(",")
      .includes("regional")
      ? getRegionalBrackets(country, reportUserData.cityId)
      : [];
    const stateBrackets = getStateBrackets(country, reportUserData.cityId);

    const { tax: stateTaxFull, allowanceTax: stateAllowanceTax } = getStateTax(
      taxableIncome,
      totalAllowance,
      !isExclusiveRegion,
      stateBrackets
    );

    const { tax: regionalTaxFull, allowanceTax: regionalAllowanceTax } =
      getRegionalTax(taxableIncome, totalAllowance, regionalBrackets);

    const taxCredit = getTaxCredits(
      regime.rules,
      reportUserData,
      kidAddition[scenario],
      taxableIncome,
      isForJoint
    ) / reportUserData.incomes.length;

    const totalTax = stateTaxFull + regionalTaxFull - taxCredit;
    const net = income.income - expenses - socials[0];
    const netIncome = net - totalTax;

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
