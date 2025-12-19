import type { PriceDto } from "../prices/prices.dto";
import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../reports/reports.dto";
import type {
  ExchangeRate,
  PrepReportItem,
  TaxAnalytic,
  TaxBracket,
  TaxResult,
} from "../types/flow.types";
import {
  FAMILY_BUDGET,
  FAMILY_BUDGET_LOW,
  KID_BUDGET,
  PAIR_BUDGET,
  PAIR_BUDGET_LOW,
  SOLO_BUDGET,
  SOLO_BUDGET_LOW,
  type BudgetItem,
} from "./budgetData";
import { roundToTwoDecimals } from "./numbers";
import { calculateTax } from "./taxes/spain";

export function convertUserData(
  userData: ReportUserDataDto,
  rates: ExchangeRate
) {
  return {
    ...userData,
    incomes: userData.incomes.map((item) => {
      if (item.currency !== "eur") {
        return {
          ...item,
          income: item.income * rates[item.currency],
          accountantCost: item.accountantCost * rates[item.currency],
          expensesCost: item.expensesCost * rates[item.currency],
        };
      } else {
        return { ...item };
      }
    }),
  };
}

export function getProgressiveTax(taxBase: number, brackets: TaxBracket[]) {
  let remaining = taxBase;
  let totalTax = 0;

  for (const bracket of brackets) {
    if (taxBase > bracket.from) {
      const taxable = Math.min(remaining, bracket.to - bracket.from + 1);
      totalTax += taxable * (bracket.rate / 100);
      remaining -= taxable;
    }
    if (remaining <= 0) break;
  }

  const effectiveRate = (totalTax / taxBase) * 100;

  return {
    taxBase,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

export function calculateFederalIncomeTax({
  income,
  taxPaidAbroad,
  eurRate,
}: {
  income: number;
  taxPaidAbroad: number;
  eurRate: number;
}): TaxResult {
  const FEIE_LIMIT = 128000 * eurRate;
  const federalBrackets = [
    { from: 0, to: 11000 * eurRate, rate: 0.1 },
    { from: 11000 * eurRate, to: 44725 * eurRate, rate: 0.12 },
    { from: 44725 * eurRate, to: 95375 * eurRate, rate: 0.22 },
    { from: 95375 * eurRate, to: 182100 * eurRate, rate: 0.24 },
    { from: 182100 * eurRate, to: 231250 * eurRate, rate: 0.32 },
    { from: 231250 * eurRate, to: 578125 * eurRate, rate: 0.35 },
    { from: 578125 * eurRate, to: Infinity, rate: 0.37 },
  ];

  const name = "federal income tax";

  if (income <= FEIE_LIMIT) {
    return {
      name,
      amount: 0,
      comment:
        "Your foreign earned income is below the Foreign Earned Income Exclusion (FEIE) limit of $128,000, so you owe no U.S. federal income tax under Form 2555.",
    };
  }

  const taxableIncome = income - FEIE_LIMIT;

  let usTax = 0;
  for (const bracket of federalBrackets) {
    if (taxableIncome > bracket.from) {
      const taxableInBracket =
        Math.min(taxableIncome, bracket.to) - bracket.from;
      usTax += taxableInBracket * bracket.rate;
    }
  }

  // Compare with tax paid abroad
  const credit = Math.min(taxPaidAbroad, usTax);
  const taxOwed = Math.max(usTax - credit, 0);

  // Build proper comment
  let comment = "";

  if (credit >= usTax) {
    comment =
      "Although your income exceeds the FEIE limit, you can offset your U.S. federal tax using the Foreign Tax Credit for taxes paid in Spain. Your tax liability in the U.S. is fully covered.";
  } else if (credit > 0 && credit < usTax) {
    comment =
      "Your income exceeds the FEIE limit, and your foreign tax credit partially offsets your U.S. federal tax liability. You must pay the remaining difference to the IRS.";
  } else {
    comment =
      "Your income exceeds the FEIE limit, and you did not claim any foreign tax credit. You are liable for full U.S. federal income tax on the amount above the exclusion limit.";
  }

  return {
    name,
    amount: Math.round(taxOwed * 100) / 100,
    comment,
  };
}

export const calculateUSTax = (
  incomes: PersonalIncomesDto[],
  interimIncomes: TaxAnalytic[],
  rate: number
) => {
  const result: TaxResult[] = [];

  incomes.forEach((item, index) => {
    if (item.isUSCitizen) {
      result.push(
        calculateFederalIncomeTax({
          income: item.income,
          taxPaidAbroad: interimIncomes[index].totalTax,
          eurRate: rate,
        })
      );
    } else {
      result.push({ name: "incomeTax", amount: 0, comment: "" });
    }
  });

  return result;
};

export function getTaxCalculationFunction(country: string) {
  if (country === "Spain") return calculateTax;
  if (country === "Portugal") return calculateTax;
  if (country === "Italy") return calculateTax;
  if (country === "Czech Republic") return calculateTax;
  if (country === "Bulgaria") return calculateTax;
  if (country === "Serbia") return calculateTax;
  if (country === "Romania") return calculateTax;
  if (country === "Georgia") return calculateTax;

  return null;
}

function getBudgetWithKids(item: BudgetItem, kidsNum: number) {
  const addition = KID_BUDGET.find(
    (kidItem) => kidItem.productId === item.productId
  );
  if (addition) {
    return {
      ...item,
      quantity: item.quantity + addition.quantity * kidsNum,
    };
  } else {
    return { ...item };
  }
}

export function getValidPriceStructure(kidsNum: number, adultNum: number) {
  let comfortStructure = null;
  let lowStructure = null;
  if (kidsNum === 0) {
    if (adultNum === 1) {
      comfortStructure = SOLO_BUDGET;
      lowStructure = SOLO_BUDGET_LOW;
    } else {
      comfortStructure = PAIR_BUDGET;
      lowStructure = PAIR_BUDGET_LOW;
    }
  } else {
    if (adultNum === 1) {
      comfortStructure = SOLO_BUDGET.map((item) =>
        getBudgetWithKids(item, kidsNum)
      );
      lowStructure = SOLO_BUDGET_LOW.map((item) =>
        getBudgetWithKids(item, kidsNum)
      );
    } else {
      comfortStructure = FAMILY_BUDGET.map((item) =>
        getBudgetWithKids(item, kidsNum)
      );
      lowStructure = FAMILY_BUDGET_LOW.map((item) =>
        getBudgetWithKids(item, kidsNum)
      );
    }
  }

  return {
    comfortStructure,
    lowStructure,
  };
}

export function calculateBudget(
  budgetItems: BudgetItem[],
  prices: PriceDto[]
): number {
  let total = 0;

  for (const item of budgetItems) {
    const priceObj = prices.find((p) => p.productId === item.productId);
    if (!priceObj) {
      console.warn(`Missing price for productId ${item.productId}`);
      continue;
    }

    let price: number = priceObj.price;

    if (item.type === "top") price = priceObj.top || priceObj.price * 1.4;
    if (item.type === "bottom") price = priceObj.bottom || priceObj.price * 0.7;

    total += item.quantity * price;
  }

  const buffer = total * 0.1;
  return roundToTwoDecimals(total + buffer);
}

export function getUserStructure(reportUserData: ReportUserDataDto) {
  let kidsNum = 0;
  let spouseNum = 0;
  for (const dep of reportUserData.dependents) {
    if (dep.type === "kid") kidsNum++;
    else if (dep.type === "spouse") spouseNum++;
  }
  const adultNum = spouseNum + reportUserData.incomes.length;

  return {
    kidsNum,
    spouseNum,
    adultNum,
  };
}

export function decorateItems(items: CreateReportItemDto[]) {
  const today = new Date();
  return items.map((item, index) => {
    return {
      ...item,
      id: index + 1,
      createdAt: today.toISOString(),
    };
  });
}

export function packageReportItems(items: PrepReportItem[], itemIndex: number) {
  const reportItems: CreateReportItemDto[] = [];

  for (let index = 0; index < items.length; index++) {
    const element = items[index];
    reportItems.push({
      reportId: 0,
      incomeMaker: itemIndex,
      label: element.label,
      type: element.type,
      amount: element.amount,
      note: element.note || "",
    });
  }

  return reportItems;
}
