import type {
  CreateReportItemDto,
  DependentsDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import { calculateFederalIncomeTax, getProgressiveTax } from "../saveFlow";
import { getPortugalBrackets } from "../taxData";

const scenarios = ["1st", "2nd", "3rd", "4th", "5th"];

function getDependentCredits(dependents: DependentsDto[]) {
  const householdCredit = 250;
  const dependentCredit = 600 * dependents.length;
  const healthEduAvg = 300;

  return householdCredit + dependentCredit + healthEduAvg;
}

function getJovemExemptionRate(year: number) {
  if (year === 1) return 1;
  if (year > 1 && year < 5) return 0.75;
  if (year > 4 && year < 8) return 0.5;
  if (year > 7 && year < 11) return 0.25;

  return 0;
}

function getJovemReduction(age: number, base: number, year: number) {
  const JOVEM_LIMIT = 35;
  const JOVEM_CAP = 28737.5;
  const exemptionRate = getJovemExemptionRate(year);

  if (age <= JOVEM_LIMIT) {
    return Math.min(JOVEM_CAP, base * exemptionRate);
  }

  return 0;
}

function calculateTaxBase(
  reportUserData: ReportUserDataDto,
  year: number,
  index: number
) {
  const income = reportUserData.incomes[index];
  const gross = income.income;
  const expenses = income.expensesCost + income.accountantCost;
  const isSimplified = expenses < gross * 0.25;
  const grossWithoutExpenses = isSimplified ? gross * 0.75 : gross - expenses;

  const socials = year === 1 ? 0 : (gross / 12) * 3 * 0.7 * 0.214 * 4;
  const personalReduction = 4462;
  const base = grossWithoutExpenses - socials - personalReduction;
  const jovemReduction = getJovemReduction(income?.age || 50, base, year);

  return base - jovemReduction;
}

function calculateJoint(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  year: number
) {
  const personalReduction = 4462;
  const reportItems: CreateReportItemDto[] = [];
  const creditLimit = 120000;
  const taxableBases: number[] = [];
  const socials: number[] = [];
  for (let index = 0; index < 2; index++) {
    const base = calculateTaxBase(reportUserData, year, index);
    const social =
      year === 1
        ? 0
        : (reportUserData.incomes[index].income / 12) * 3 * 0.7 * 0.214 * 4;

    taxableBases.push(base);
    socials.push(social);
  }

  const taxableBase = taxableBases.reduce((prev, next) => prev + next, 0);
  const dependentCredits = getDependentCredits(reportUserData.dependents);
  const brackets = getPortugalBrackets(reportUserData.cityId);
  const grossTaxPerPerson = getProgressiveTax(taxableBase / 2, brackets);
  const creditsCap =
    taxableBase > creditLimit
      ? 1000
      : 1000 + 4000 * (1 - (taxableBase - 25656) / (creditLimit - 25656));
  const taxCredits = Math.min(creditsCap, dependentCredits) / 2;
  const totalTaxPerPerson = Math.max(
    0,
    grossTaxPerPerson.totalTax - taxCredits
  );

  for (let index = 0; index < 2; index++) {
    const income = reportUserData.incomes[index];
    const gross = income.income;
    const expenses = income.expensesCost + income.accountantCost;

    const net = gross - socials[index] - totalTaxPerPerson - expenses;
    const effectiveRate = Math.max(
      0,
      (socials[index] + totalTaxPerPerson) / gross
    );

    const federalTax = calculateFederalIncomeTax({
      income: gross,
      taxPaidAbroad: totalTaxPerPerson,
      eurRate,
    });

    if (year === 1) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Gross income normalized",
        type: "gross",
        amount: gross,
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
        label: "Personal reduction",
        type: "reduction",
        amount: personalReduction,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "General tax credit",
        type: "tax_credit",
        amount: taxCredits,
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
        amount: taxableBase,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total income tax",
        type: "total_tax",
        amount: totalTaxPerPerson,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Effective tax",
        type: "effective_tax",
        amount: effectiveRate,
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
          note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
        });
      }

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total net income",
        type: "net",
        amount: net,
      });
    } else {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total tax",
        type: `additional_${scenarios[year - 1]}`,
        amount: socials[index] + totalTaxPerPerson,
      });
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total net income",
        type: `additional_${scenarios[year - 1]}`,
        amount: net,
      });
    }
  }

  return reportItems;
}

function calculateIndividual(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  year: number
) {
  const personalReduction = 4462;
  const reportItems: CreateReportItemDto[] = [];
  const creditLimit = 80000;
  const income = reportUserData.incomes[0];
  const gross = income.income;
  const expenses = income.expensesCost + income.accountantCost;

  const taxableBase = calculateTaxBase(reportUserData, year, 0);

  const socials = year === 1 ? 0 : (gross / 12) * 3 * 0.7 * 0.214 * 4;

  const brackets = getPortugalBrackets(reportUserData.cityId);
  const grossTax = getProgressiveTax(taxableBase, brackets);
  const creditsCap =
    taxableBase > creditLimit
      ? 1000
      : 1000 + 1500 * (1 - (taxableBase - 8059) / (creditLimit - 8059));
  const dependentCredits = getDependentCredits(reportUserData.dependents);
  const taxCredits = Math.min(creditsCap, dependentCredits);
  const totalTax = Math.max(0, grossTax.totalTax - taxCredits);
  const net = gross - socials - totalTax - expenses;
  const effectiveRate = Math.max(0, (socials + totalTax) / gross);

  const federalTax = calculateFederalIncomeTax({
    income: gross,
    taxPaidAbroad: totalTax,
    eurRate,
  });
  const index = 0;

  if (year === 1) {
    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Gross income normalized",
      type: "gross",
      amount: gross,
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
      label: "Personal reduction",
      type: "reduction",
      amount: personalReduction,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "General tax credit",
      type: "tax_credit",
      amount: taxCredits,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Total social contributions",
      type: "social_contributions",
      amount: socials,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Taxable income",
      type: "taxable_income",
      amount: taxableBase,
    });

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
      amount: effectiveRate,
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

    if (income.isUSCitizen && socials) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "US self employed tax",
        type: "us_self_tax",
        amount: 0,
        note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
      });
    }

    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Total net income",
      type: "net",
      amount: net,
    });
  } else {
    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Total tax",
      type: `additional_${scenarios[year - 1]}`,
      amount: socials + totalTax,
    });
    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Total net income",
      type: `additional_${scenarios[year - 1]}`,
      amount: net,
    });
  }

  return reportItems;
}

export function calculatePortugalTax(
  reportUserData: ReportUserDataDto,
  eurRate: number
) {
  const reportItems: CreateReportItemDto[] = [];
  if (reportUserData.incomes.length > 1) {
    const highestAge = reportUserData.incomes.reduce((prev, next) => {
      if (prev > (next.age || 0)) {
        return prev;
      }
      return next.age || 36;
    }, 0);
    const ageDiff = 36 - (highestAge || 36);
    const diff = ageDiff < 3 ? 3 : ageDiff;
    const years = diff > 0 ? Math.min(diff, 5) : 3;
    for (let index = 0; index < years; index++) {
      const year = index + 1;
      const items = calculateJoint(reportUserData, eurRate, year);
      reportItems.push(...items);
    }
  } else {
    const ageDiff = 36 - (reportUserData.incomes[0].age || 36);
    const diff = ageDiff < 3 ? 3 : ageDiff;
    const years = diff > 0 ? Math.min(diff, 5) : 3;

    for (let index = 0; index < years; index++) {
      const year = index + 1;
      const items = calculateIndividual(reportUserData, eurRate, year);
      reportItems.push(...items);
    }
  }

  return reportItems;
}
