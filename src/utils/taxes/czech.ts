import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { PrepReportItem, SpainOption } from "../../types/flow.types";
import {
  calculateFederalIncomeTax,
  getProgressiveTax,
  packageReportItems,
} from "../saveFlow";
import { stateTaxBracketsCzech } from "../taxData";

function getCzechTaxCredit(reportUserData: ReportUserDataDto) {
  const personalCredit = 1260;
  const wifeCredit = 1015;
  const kidsCredits = [620, 910, 1135, 1135, 1135];

  let result = personalCredit;
  let kids = 0;
  let kidUnder3 = false;
  let dependentWife = false;

  reportUserData.dependents.forEach((item) => {
    if (item.type === "kid") {
      if ((item?.age || 4) < 3) {
        kidUnder3 = true;
      }
      kids++;
    } else {
      if (item.isDependent) {
        dependentWife = true;
      }
    }
  });

  if (dependentWife && kidUnder3) {
    result = result + wifeCredit;
  }

  if (kids > 0) {
    const kidsCredit = kidsCredits
      .slice(0, kids)
      .reduce((prev, next) => prev + next, 0);
    result = result + kidsCredit;
  }

  return result / reportUserData.incomes.length;
}

function getCzechSocials(taxableBase: number) {
  const socialBase = taxableBase * 0.55;
  const maxLimit = 91385;
  const minLimit = 2335;

  const newBase = Math.min(socialBase, maxLimit);
  const socialRate = 0.292;

  return Math.max(minLimit, newBase * socialRate);
}

function getCzechHealth(taxableBase: number) {
  const healthBase = taxableBase * 0.5;
  const minLimit = 1540;

  const socialRate = 0.135;

  return Math.max(minLimit, healthBase * socialRate);
}

function getMonthlyTax(income: number) {
  const cliff1 = 40500;
  const cliff2 = 61000;
  if (income < cliff1) {
    return 350;
  }

  if (income < cliff2) {
    return 680;
  }

  return 1100;
}

function getFlatTaxItems(
  income: PersonalIncomesDto,
  eurRate: number,
  index: number,
  scenario: SpainOption
) {
  const monthly = getMonthlyTax(income.income);

  const expenses = income.expensesCost + income.accountantCost;
  const taxableBase = income.income - expenses;
  const totalTax = monthly * 12;
  const socials = 0;
  const effectiveRate = Math.max(0, (socials + totalTax) / income.income);

  const net = income.income - totalTax - socials - expenses;

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
            label: "Total social contributions",
            type: "social_contributions",
            amount: socials,
            note: "Social contributions are included in the monthly tax expenses.",
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
                  note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
                },
              ]
            : []),
          {
            label: "Total net income",
            type: "net",
            amount: net,
          },
          {
            label: "Flat Czech Regime",
            type: "tax_type",
            amount: 0,
            note: "Osoba Samostatně Výdělečně Činná - Individually Earning Person",
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

function getRegularTaxItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  index: number,
  scenario: SpainOption
) {
  const income = reportUserData.incomes[index];
  const expenses = income.expensesCost + income.accountantCost;
  const lumpSumExpenses = income.income * 0.6;
  const isLumSum = lumpSumExpenses > expenses;
  const taxableBase = income.income - (isLumSum ? lumpSumExpenses : expenses);

  const socials = getCzechSocials(taxableBase);
  const health = getCzechHealth(taxableBase);

  const stateTax = getProgressiveTax(taxableBase, stateTaxBracketsCzech);

  const taxCredit = getCzechTaxCredit(reportUserData);
  const totalTax = stateTax.totalTax - taxCredit;

  const effectiveRate = Math.max(
    0,
    (socials + health + totalTax) / income.income
  );

  const net = income.income - totalTax - socials - health - expenses;

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
            label: "Lump-sum reduction",
            type: "reduction",
            amount: isLumSum ? lumpSumExpenses : 0,
          },
          {
            label: "Total social contributions",
            type: "social_contributions",
            amount: socials,
          },
          {
            label: "Health Insurance",
            type: "health_insurance",
            amount: health,
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
            label: "Total income tax",
            type: "total_tax",
            amount: totalTax,
          },
          {
            label: "Total tax credit",
            type: "tax_credit",
            amount: taxCredit,
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
                  note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
                },
              ]
            : []),
          {
            label: "Total net income",
            type: "net",
            amount: net,
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
            amount: totalTax + socials + health,
          },
          {
            label: "Total net income",
            type: `additional_${scenario}`,
            amount: net,
          },
        ];

  return packageReportItems(prepItems, index);
}

function getSingleYearTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) {
  const reportItems: CreateReportItemDto[] = [];
  const limit = 81000;

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];

    if (income.income > limit) {
      const items = getRegularTaxItems(
        reportUserData,
        eurRate,
        index,
        scenario
      );
      reportItems.push(...items);
    } else {
      const items = getFlatTaxItems(
        reportUserData.incomes[index],
        eurRate,
        index,
        scenario
      );
      reportItems.push(...items);
    }
  }

  return reportItems;
}

export function calculateCzechTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  country: string,
) {
  const first = getSingleYearTax(reportUserData, eurRate);
  const second = getSingleYearTax(reportUserData, eurRate, "2nd");
  const third = getSingleYearTax(reportUserData, eurRate, "3rd");

  return [...first, ...second, ...third];
}
