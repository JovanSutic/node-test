import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { PrepReportItem, SpainOption } from "../../types/flow.types";
import { calculateFederalIncomeTax, packageReportItems } from "../saveFlow";

type SerbiaTaxTypes = "Booked" | "Flat" | "LLC";

function getTaxType(income: PersonalIncomesDto) {
  const flatLimit = 51000;
  if (income.isIndependent) {
    if (income.income > flatLimit) {
      return "Booked";
    } else {
      return "Flat";
    }
  } else {
    return "LLC";
  }
}

function getSalaryBasicInfo(minSalary: number) {
  const unTaxedPart = 243;
  const minSalaryYear = minSalary * 12;
  const pensionContribution = minSalary * 0.24;
  const healthContribution = minSalary * 0.13;
  const unemploymentContribution = minSalary * 0.0075;
  const tax = (minSalary - unTaxedPart) * 0.1;

  return {
    minSalaryYear,
    salarySocials:
      (pensionContribution + healthContribution + unemploymentContribution) *
      12,
    salaryTax: tax * 12,
  };
}

function calculateGross2(gross1: number): number {
  const employerPensionRate = 0.1; // PIO on gross1
  const employerUnemploymentRate = 0.0025; // Unemployment on gross1

  // --- Calculations ---
  const employerContributions =
    gross1 * employerPensionRate + gross1 * employerUnemploymentRate;

  return gross1 + employerContributions;
}

function calculateAnnualPersonalIncomeTax(
  totalIncome: number,
  numberOfDependents: number,
  age: number
): number {
  const averageAnnualSalary = 10850;
  const nonTaxableAmount = averageAnnualSalary * 3;
  const secondTaxBracketThreshold = averageAnnualSalary * 6;

  const taxpayerDeduction = 0.4 * averageAnnualSalary;
  const dependentDeduction = 0.15 * averageAnnualSalary;

  const under40Deductions = age < 40 ? nonTaxableAmount : 0;
  const personalDeductions = Math.min(totalIncome * 0.5, taxpayerDeduction + dependentDeduction * numberOfDependents);
  const totalDeductions = under40Deductions || personalDeductions;

  let taxableBase = 0;

  if (totalIncome <= nonTaxableAmount) {
    return 0;
  }

  const netIncomeAfterNonTaxableAmount = totalIncome - nonTaxableAmount;

  if (netIncomeAfterNonTaxableAmount <= totalDeductions) {
    taxableBase = 0;
  } else {
    taxableBase = netIncomeAfterNonTaxableAmount - totalDeductions;
  }

  if (taxableBase <= 0) {
    return 0;
  } else if (taxableBase <= secondTaxBracketThreshold - nonTaxableAmount) {
    return taxableBase * 0.1;
  } else {
    const baseFirstPart =
      secondTaxBracketThreshold - nonTaxableAmount - totalDeductions;
    const taxFirstPart = baseFirstPart * 0.1;
    const baseSecondPart = taxableBase - baseFirstPart;
    const taxSecondPart = baseSecondPart * 0.15;
    return taxFirstPart + taxSecondPart;
  }
}

function getBookedItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  index: number
) {
  const minSalary = 392;
  const { minSalaryYear, salaryTax, salarySocials } =
    getSalaryBasicInfo(minSalary);
  const income = reportUserData.incomes[index];
  const gross = income.income;
  const expenses = income.accountantCost + income.expensesCost;
  const taxableBase = gross - expenses - minSalaryYear;
  const stateTax = taxableBase * 0.1;
  const socials = salarySocials;

  const salaryContributions = salaryTax + socials;
 
  

  const firstNet =
    taxableBase - stateTax + (minSalaryYear - salaryContributions);
  const dependents =
    reportUserData.dependents.length / reportUserData.incomes.length;
    // ovo ću da računam kao neki dodatni tax
  const additionalTax = calculateAnnualPersonalIncomeTax(firstNet, dependents, income.age || 40);

  const totalTax = stateTax + salaryTax + additionalTax;
  const net = firstNet - additionalTax;

  const effectiveRate = Math.max(0, (socials + totalTax) / gross);

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
            amount: gross,
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
          },
          {
            label: "Taxable income",
            type: "taxable_income",
            amount: taxableBase,
          },
          {
            label: "State income tax",
            type: "income_tax",
            amount: stateTax,
          },
          {
            label: "Additional income tax",
            type: "income_tax",
            amount: additionalTax,
          },
          {
            label: "Yearly salary",
            type: "gross_salary",
            amount: minSalaryYear,
          },
          {
            label: "Yearly salary contributions",
            type: "salary_contributions",
            amount: salaryContributions,
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
            label: "Bookkeeping Regime",
            type: "tax_type",
            amount: 0,
            note: "Preduzetnik koji vodi knjige",
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

function getCompanyItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  index: number
) {
  const minSalary = 392;
  const grossSalary = calculateGross2(minSalary);
  const { minSalaryYear, salaryTax, salarySocials } =
    getSalaryBasicInfo(grossSalary);
  const income = reportUserData.incomes[index];
  const gross = income.income;
  const expenses = income.accountantCost + income.expensesCost;

  const taxableBase = gross - expenses - minSalaryYear;
  const corporateTax = taxableBase * 0.15;
  const netProfit = taxableBase - corporateTax;
  const withholdingTax = netProfit * 0.15;
  const socials = salarySocials;
  const salaryContributions = salaryTax + socials;
  const firstNet =
    netProfit - withholdingTax + (minSalaryYear - salaryContributions);
  const dependents =
    reportUserData.dependents.length / reportUserData.incomes.length;
  const additionalTax = calculateAnnualPersonalIncomeTax(firstNet, dependents, income.age || 40);

  const totalTax = corporateTax + withholdingTax + salaryTax + additionalTax;
  const net = firstNet - additionalTax;

  const effectiveRate = Math.max(0, (socials + totalTax) / gross);

  const federalTax = calculateFederalIncomeTax({
    income: gross,
    taxPaidAbroad: totalTax,
    eurRate,
  });

  const prepItems: PrepReportItem[] =
    scenario === "1st"
      ? [
          {
            label: "Gross income normalized",
            type: "gross",
            amount: gross,
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
          },
          {
            label: "Taxable income",
            type: "taxable_income",
            amount: taxableBase,
          },
          {
            label: "Withholding tax",
            type: "dividend_tax",
            amount: withholdingTax,
          },
          {
            label: "Corporate income tax",
            type: "income_tax",
            amount: corporateTax,
          },
          {
            label: "Additional income tax",
            type: "income_tax",
            amount: additionalTax,
          },
          {
            label: "Yearly salary",
            type: "gross_salary",
            amount: minSalaryYear,
          },
          {
            label: "Yearly salary contributions",
            type: "salary_contributions",
            amount: salaryContributions,
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
            label: "LLC Regime",
            type: "tax_type",
            amount: 0,
            note: "Društvo sa ograničenom odgovornošću - DOO",
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

function getFlatItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  index: number
) {
  const income = reportUserData.incomes[index];
  const gross = income.income;
  const expenses = income.expensesCost;
  const flatMonthlyTax = 360;
  const totalTax = flatMonthlyTax * 12;

  const socials = 0;
  const effectiveRate = Math.max(0, (socials + totalTax) / gross);

  const net = gross - totalTax - socials - expenses;

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
            label: "Flat Serbian Regime",
            type: "tax_type",
            amount: 0,
            note: "Paušalni porez",
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

function getCostItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  index: number,
  type: SerbiaTaxTypes
) {
  if (type === "Booked") {
    return getBookedItems(reportUserData, eurRate, scenario, index);
  }
  if (type === "Flat") {
    return getFlatItems(reportUserData, eurRate, scenario, index);
  }

  return getCompanyItems(reportUserData, eurRate, scenario, index);
}

function getSingleYearTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) {
  const reportItems: CreateReportItemDto[] = [];

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];
    const type = getTaxType(income);
    const items = getCostItems(reportUserData, eurRate, scenario, index, type);
    reportItems.push(...items);
  }

  return reportItems;
}

export function calculateSerbiaTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  country: string,
) {
  const first = getSingleYearTax(reportUserData, eurRate);
  const second = getSingleYearTax(reportUserData, eurRate, "2nd");
  const third = getSingleYearTax(reportUserData, eurRate, "3rd");

  return [...first, ...second, ...third];
}
