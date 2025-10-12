import type {
  DependentsDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type {
  IncomeBasics,
  TaxAdditions,
  TaxConfig,
  TaxRules,
} from "../../types/taxes.types";
import { socialBrackets } from "../taxData";
import { getConfigRegime } from "./config";
import { getJovemExemptionRate } from "./portugal";

function getAgeReduction(
  age: number,
  base: number,
  year: number,
  rules: TaxRules
) {
  const exemptionRate = getJovemExemptionRate(year);

  if (age <= rules.reduction.other.age) {
    return Math.min(rules.reduction.other.ageCap, base * exemptionRate);
  }

  return 0;
}

export function getReductions(
  incomeBasics: IncomeBasics,
  additions: TaxAdditions,
  year: number,
  rules: TaxRules
) {
  const result = {
    otherReductions: 0,
    newSelfEmployedReduction: 0,
    assumedCostReduction: 0,
    taxableIncome: 0,
  };

  const { gross, expenses, socials, kids, minSalary } = incomeBasics;
  let statefulBase = gross;

  const sequence = rules.tax.taxableIncomeSequence.split(",");

  const newReduction =
    year < rules.reduction.newCompany.yearLength
      ? rules.reduction.newCompany.reduction
      : 0;

  sequence.forEach((item) => {
    if (item === "expensesReduction" && rules.reduction.other.allow) {
      statefulBase = statefulBase - expenses;
    }
    if (item === "socialsReduction" && rules.reduction.other.allow) {
      statefulBase = statefulBase - socials;
    }
    if (item === "minSalaryReduction" && rules.salary) {
      statefulBase = statefulBase - (minSalary || 0);
    }
    if (
      item === "allowNewCompanyReduction" &&
      rules.reduction.newCompany.allow
    ) {
      const reduction = Math.min(
        statefulBase * newReduction,
        rules.reduction.newCompany.maxReduction
      );
      result.newSelfEmployedReduction = reduction;
      statefulBase = statefulBase - reduction;
    }
    if (
      item === "allowAssumedCostReduction" &&
      rules.reduction.assumedCost.allow
    ) {
      const reduction = Math.min(
        statefulBase * rules.reduction.assumedCost.reduction,
        rules.reduction.assumedCost.maxReduction
      );
      result.assumedCostReduction = reduction;
      statefulBase = statefulBase - reduction;
    }
    if (item === "allowPersonalReduction" && rules.reduction.other.allow) {
      const reduction = rules.reduction.other.personal;
      statefulBase = statefulBase - reduction;
    }
    if (item === "allowAgeReduction" && rules.reduction.other.allow) {
      const reduction = getAgeReduction(additions.age, gross, year + 1, rules);
      statefulBase = statefulBase - reduction;
    }
    if (
      item === "specialImpatriReduction" &&
      (rules.reduction.other.kids || 0) > 0
    ) {
      const index =
        (kids || 0) > 0
          ? rules.reduction.other.kids!
          : rules.reduction.assumedCost.reduction;

      const reduction = statefulBase * index;
      statefulBase = statefulBase - reduction;
    }
    if (item === "kidsReduction" && (rules.reduction.other.kids || 0) > 0) {
      const reduction = rules.reduction.other.kids! * (kids || 0);
      statefulBase = statefulBase - reduction;
    }
  });

  result.taxableIncome = Math.max(0, statefulBase);

  return result;
}

function calculateSocialBase(
  income: PersonalIncomesDto,
  rules: TaxRules,
  year: number,
  kids = 0
) {
  if (rules.social.baseType === "incomeMinusAllExpenses") {
    return (
      ((income.income - (income.expensesCost + income.accountantCost)) *
        rules.social.rateIndex) /
      12
    );
  }
  if (rules.social.baseType === "income") {
    return income.income * rules.social.rateIndex;
  }

  if (rules.social.baseType === "taxIncome") {
    const { taxableIncome } = getReductions(
      {
        gross: income.income,
        expenses: income.accountantCost + income.expensesCost,
        socials: 0,
        kids,
      },
      { age: income.age || 50 },
      year,
      rules
    );

    return taxableIncome;
  }

  if (rules.social.baseType === "taxIncomeAndRate") {
    const { taxableIncome } = getReductions(
      {
        gross: income.income,
        expenses: income.accountantCost + income.expensesCost,
        socials: 0,
        kids,
      },
      { age: income.age || 50 },
      year,
      rules
    );

    const base = taxableIncome * rules.social.rateIndex;

    return rules.social.maxCapBase
      ? Math.min(base, rules.social.maxCapBase)
      : base;
  }

  if (rules.social.baseType === "flat" && rules.social.baseAmount) {
    if (rules.social.baseFrequency === "monthly") {
      return rules.social.baseAmount * 12;
    }

    return rules.social.baseAmount;
  }

  if (
    rules.social.baseType === "incomeBetweenMaxMin" &&
    rules.social.minCapBase &&
    rules.social.maxCapBase
  ) {
    const base = Math.min(
      Math.max(income.income, rules.social.minCapBase),
      rules.social.maxCapBase
    );
    return base;
  }

  return 0;
}

export const calculateSocials = (
  incomes: PersonalIncomesDto[],
  regime: TaxRules,
  year: number,
  dependents?: DependentsDto[]
) => {
  const result = [];

  for (let index = 0; index < incomes.length; index++) {
    if (regime.social.allowDiscount && year < regime.social.discountLength) {
      result.push(regime.social.discountedAmount);
    } else {
      const base = calculateSocialBase(
        incomes[index],
        regime,
        year,
        dependents?.filter((item) => item.type === "kid").length || 0
      );
      if (regime.social.type === "progressive") {
        const bracket = socialBrackets.find((item) => {
          if (base > item.from && base < item.to) {
            return item;
          }
        });

        result.push((bracket?.fee || 1) * 12);
      } else {
        const social = base * regime.social.rate;
        if (regime.social.minCap && regime.social.maxCap === 0) {
          result.push(Math.max(regime.social.minCap, social));
        } else {
          result.push(Math.min(regime.social.maxCap, social));
        }
      }
    }
  }

  return result;
};

export function getJoinTaxableIncome(
  reportUserData: ReportUserDataDto,
  config: TaxConfig,
  year: number
) {
  let jointTaxableIncome = 0;
  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];
    const regime = getConfigRegime(
      config,
      income,
      reportUserData.incomes.length
    )!;
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
