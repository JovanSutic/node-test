import type {
  CreateReportItemDto,
  DependentsDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { PrepReportItem, SpainOption } from "../../types/flow.types";
import {
  calculateFederalIncomeTax,
  getProgressiveTax,
  packageReportItems,
} from "../saveFlow";
import {
  regionalTaxBracketsItaly,
  regionsItaly,
  stateTaxBracketsItaly,
} from "../taxData";

type ItalianTaxType = "flat" | "impatriate" | "ordinary";
const coefficientMap: Record<string, number> = {
  software: 67,
  other: 78,
  ecommerce: 40,
  dropship: 62,
};

function getTaxCredit(dependents: DependentsDto[], income: number) {
  const isDependentSpouse = dependents.find(
    (item) => item.type === "spouse" && item.isDependent
  );
  if (isDependentSpouse) {
    return 800 - 110 * (income / 15000);
  }

  return 0;
}

function getCoefficientExpenses(income: PersonalIncomesDto) {
  let coefficient = 78;
  if (income.workType) {
    coefficient = coefficientMap[income.workType] || 78;
  }

  return income.income * ((100 - coefficient) / 100);
}

function getTaxType(income: PersonalIncomesDto) {
  const flatLimit = 85000.01;
  const expenses = income.expensesCost + income.accountantCost;

  if (income.income < flatLimit) {
    const expectedExpenses = getCoefficientExpenses(income);
    if (expectedExpenses > expenses) return "flat";
  } else {
    if (income.isSpecialist) return "impatriate";
  }

  return "ordinary";
}

function getFlatCostItems(
  income: PersonalIncomesDto,
  index: number,
  eurRate: number,
  scenario: SpainOption
) {
  const expectedExpenses = getCoefficientExpenses(income);
  const taxableBase = income.income - expectedExpenses;
  const rate = income.isNew ? 0.05 : 0.15;
  const socialRate = 0.26;
  const totalTax = taxableBase * rate;
  const socials = taxableBase * socialRate;
  const effectiveRate = Math.max(0, (socials + totalTax) / income.income);

  const net = income.income - totalTax - socials;

  const federalTax = calculateFederalIncomeTax({
    income: income.income,
    taxPaidAbroad: totalTax,
    eurRate,
  });

  const prepItems: PrepReportItem[] =
    scenario === "1st"
      ? [
          {
            label: "Gross income normalized",
            type: "gross",
            amount: income.income,
          },
          {
            label: "Profitability coefficient reduction",
            type: "reduction",
            amount: expectedExpenses,
          },
          {
            label: "Profitability coefficient reduction",
            type: "reduction",
            amount: expectedExpenses,
          },
          {
            label: "Total social contributions",
            type: "social_contributions",
            amount: socials,
          },
          {
            label: "Taxable income",
            type: "taxable_income",
            amount: taxableBase,
          },
          {
            label: "State income tax",
            type: "income_tax",
            amount: totalTax,
          },
          {
            label: "Total income tax",
            type: "total_tax",
            amount: totalTax,
          },
          {
            label: "Effective tax",
            type: "effective_tax",
            amount: effectiveRate,
          },
          ...(income.isUSCitizen
            ? [
                {
                  label: "US Federal income tax",
                  type: "us_income_tax",
                  amount: federalTax.amount,
                  note: federalTax.comment,
                },
              ]
            : []),
          ...(income.isUSCitizen && socials
            ? [
                {
                  label: "US self employed tax",
                  type: "us_self_tax",
                  amount: 0,
                  note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
                },
              ]
            : []),
          {
            label: "Total net income",
            type: "net",
            amount: net,
          },
        ]
      : [
          {
            label: "Total tax",
            type: `additional_${scenario}`,
            amount: totalTax + socials,
          },
          {
            label: "Total net income",
            type: `additional_${scenario}`,
            amount: net,
          },
        ];

  return packageReportItems(prepItems, index);
}

function getNonFlatCostItems(
  income: PersonalIncomesDto,
  dependents: DependentsDto[],
  index: number,
  eurRate: number,
  cityId: number,
  isOrdinario: boolean,
  scenario: SpainOption
) {
  const expenses = income.expensesCost + income.accountantCost;
  const firstBase = income.income - expenses;
  const impatriReduction = dependents.find(
    (item) => item.type === "kid" && (item?.age || 19) < 18
  )
    ? 0.6
    : 0.5;
  const reduction = isOrdinario ? 0 : impatriReduction;
  const taxableBase = firstBase - firstBase * reduction;

  const region = regionsItaly[cityId].region;
  const regionalTaxBrackets = regionalTaxBracketsItaly[region];
  const regionalTax = getProgressiveTax(taxableBase, regionalTaxBrackets);
  const stateTax = getProgressiveTax(taxableBase, stateTaxBracketsItaly);
  const municipalTax = taxableBase * 0.005;

  const socialRate = 0.26;
  const taxCredit = getTaxCredit(dependents, income.income);
  const totalTax =
    regionalTax.totalTax + stateTax.totalTax + municipalTax - taxCredit;
  const socials = taxableBase * socialRate;
  const effectiveRate = Math.max(0, (socials + totalTax) / income.income);

  const net = income.income - totalTax - socials;

  const federalTax = calculateFederalIncomeTax({
    income: income.income,
    taxPaidAbroad: totalTax,
    eurRate,
  });

  const prepItems: PrepReportItem[] =
    scenario === "1st"
      ? [
          {
            label: "Gross income normalized",
            type: "gross",
            amount: income.income,
          },
          {
            label: "Full business expenses",
            type: "expenses",
            amount: expenses,
          },
          {
            label: "Tax regime reduction",
            type: "reduction",
            amount: reduction,
          },
          {
            label: "Total social contributions",
            type: "social_contributions",
            amount: socials,
          },
          {
            label: "Taxable income",
            type: "taxable_income",
            amount: taxableBase,
          },
          {
            label: "State income tax",
            type: "income_tax",
            amount: stateTax.totalTax,
          },
          {
            label: "Regional income tax",
            type: "income_tax",
            amount: regionalTax.totalTax + municipalTax,
          },
          ...(taxCredit > 0
            ? [
                {
                  label: "Dependent spouse credit",
                  type: "tax_credit",
                  amount: taxCredit,
                },
              ]
            : []),
          {
            label: "Total income tax",
            type: "total_tax",
            amount: totalTax,
          },
          {
            label: "Effective tax",
            type: "effective_tax",
            amount: effectiveRate,
          },
          ...(income.isUSCitizen
            ? [
                {
                  label: "US Federal income tax",
                  type: "us_income_tax",
                  amount: federalTax.amount,
                  note: federalTax.comment,
                },
              ]
            : []),
          ...(income.isUSCitizen && socials
            ? [
                {
                  label: "US self employed tax",
                  type: "us_self_tax",
                  amount: 0,
                  note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
                },
              ]
            : []),
          {
            label: "Total net income",
            type: "net",
            amount: net,
          },
        ]
      : [
          {
            label: "Total tax",
            type: `additional_${scenario}`,
            amount: totalTax + socials,
          },
          {
            label: "Total net income",
            type: `additional_${scenario}`,
            amount: net,
          },
        ];

  return packageReportItems(prepItems, index);
}

export function calculateItalySingleYearTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) {
  const reportItems: CreateReportItemDto[] = [];

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];
    const taxType: ItalianTaxType = getTaxType(income);
    if (taxType === "flat") {
      const items = getFlatCostItems(income, index, eurRate, scenario);
      reportItems.push(...items);
    }
    if (taxType === "impatriate") {
      const items = getNonFlatCostItems(
        income,
        reportUserData.dependents,
        index,
        eurRate,
        reportUserData.cityId,
        false,
        scenario
      );
      reportItems.push(...items);
    }
    if (taxType === "ordinary") {
      const items = getNonFlatCostItems(
        income,
        reportUserData.dependents,
        index,
        eurRate,
        reportUserData.cityId,
        true,
        scenario
      );
      reportItems.push(...items);
    }
  }

  return reportItems;
}

export function calculateItalyTax(
  reportUserData: ReportUserDataDto,
  eurRate: number
) {
  const first = calculateItalySingleYearTax(reportUserData, eurRate);
  const second = calculateItalySingleYearTax(reportUserData, eurRate, "2nd");
  const third = calculateItalySingleYearTax(reportUserData, eurRate, "3rd");

  return [...first, ...second, ...third];
}
