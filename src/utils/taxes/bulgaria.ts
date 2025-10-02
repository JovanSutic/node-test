import type {
  CreateReportItemDto,
  DependentsDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { PrepReportItem, SpainOption } from "../../types/flow.types";
import { calculateFederalIncomeTax, packageReportItems } from "../saveFlow";

function getTaxReduction(dependents: DependentsDto[]) {
  const childReduction = 3070;
  const children = dependents.filter((item) => item.type === "kid").length;

  return childReduction * children;
}

function getDoubleNet(items: CreateReportItemDto[]) {
  return (
    items
      .filter((item) => item.type === "net" || item.label === 'Total net income')
      ?.reduce((prev, next) => prev + next.amount, 0) || 0
  );
}

function getSelfEmployedSocials(gross: number) {
  const socialsBaseMax = 2100 * 12;
  const socialsBaseMin = 550 * 12;
  const socialBase = Math.min(Math.max(gross, socialsBaseMin), socialsBaseMax);

  return socialBase * 0.32;
}

function calculateSpouseSalary(reduction: number) {
  const minNetSalaryMonth = 550;
  const minNetSalary = minNetSalaryMonth * 12;
  const employeeSocials = minNetSalary * 0.138;
  const companySocials = minNetSalary * 0.19;
  const taxableBase = minNetSalary - employeeSocials;
  const incomeTax = Math.max(0, (taxableBase - reduction) * 0.1);

  return {
    net: taxableBase - incomeTax,
    companyCost: minNetSalary + companySocials,
    jointCost: employeeSocials + companySocials + incomeTax,
    tax: incomeTax,
    socials: employeeSocials + companySocials,
  };
}

function getDoubleEarnerTaxItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption
) {
  const grossIncome = reportUserData.incomes.reduce(
    (prev, next) => prev + next.income,
    0
  );
  const accountingCost = reportUserData.incomes[0].accountantCost;
  const otherCosts = reportUserData.incomes.reduce(
    (prev, next) => prev + next.expensesCost,
    0
  );
  // sračunava oba grossa i troškove
  const expenses = accountingCost + otherCosts;
  const childrenReduction = getTaxReduction(reportUserData.dependents);
  // izračunava platu
  const spouseSalary = calculateSpouseSalary(childrenReduction);
  const socials = 0.283 * 550 * 12;
  const taxableBase =
    grossIncome - expenses - socials - spouseSalary.companyCost;

  const corporateTax = taxableBase * 0.1;
  const taxCredit = 0;
  const netProfit = taxableBase - corporateTax - taxCredit;
  const withholdingTax = netProfit * 0.05;
  const totalTax =
    corporateTax + withholdingTax + spouseSalary.jointCost - taxCredit;

  const effectiveRate = Math.max(0, (socials + totalTax) / grossIncome);
  const net = taxableBase - corporateTax - withholdingTax;

  const federalTax = calculateFederalIncomeTax({
    income: grossIncome,
    taxPaidAbroad: totalTax,
    eurRate,
  });

  const reportItems: CreateReportItemDto[] = [];

  if (scenario === "1st") {
    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Gross income normalized",
      type: "gross",
      amount: grossIncome,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Full business expenses",
      type: "expenses",
      amount: expenses,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Tax reductions",
      type: "reduction",
      amount: 0,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total social contributions",
      type: "social_contributions",
      amount: socials,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Taxable income",
      type: "taxable_income",
      amount: taxableBase,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Corporate income tax",
      type: "income_tax",
      amount: corporateTax,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Withholding tax",
      type: "dividend_tax",
      amount: withholdingTax,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total income tax",
      type: "total_tax",
      amount: corporateTax + withholdingTax,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Gross spouse salary",
      type: "gross_salary",
      amount: spouseSalary.net + spouseSalary.socials + spouseSalary.tax,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total tax credit",
      type: "tax_credit",
      amount: taxCredit,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Effective tax",
      type: "effective_tax",
      amount: effectiveRate,
    });

    if (reportUserData.incomes[0].isUSCitizen) {
      reportItems.push({
        reportId: 0,
        incomeMaker: 0,
        label: "US Federal income tax",
        type: "us_income_tax",
        amount: federalTax.amount,
        note: federalTax.comment,
      });
    }

    if (reportUserData.incomes[0].isUSCitizen && socials) {
      reportItems.push({
        reportId: 0,
        incomeMaker: 0,
        label: "US self employed tax",
        type: "us_self_tax",
        amount: 0,
        note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
      });
    }

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total net income",
      type: "net",
      amount: net,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "EOOD DOUBLE",
      type: "tax_type",
      amount: 0,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 1,
      label: "Total social contributions",
      type: "social_contributions",
      amount: spouseSalary.socials,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 1,
      label: "State income tax",
      type: "income_tax",
      amount: spouseSalary.tax,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 1,
      label: "Total net income",
      type: "net",
      amount: spouseSalary.net,
    });

    reportItems.push({
      reportId: 0,
      incomeMaker: 1,
      label: "EOOD DOUBLE",
      type: "tax_type",
      amount: 0,
    });

    if (reportUserData.incomes[1].isUSCitizen) {
      reportItems.push({
        reportId: 0,
        incomeMaker: 1,
        label: "US Federal income tax",
        type: "us_income_tax",
        amount: 0,
        note: federalTax.comment,
      });
    }

    if (reportUserData.incomes[1].isUSCitizen) {
      reportItems.push({
        reportId: 0,
        incomeMaker: 1,
        label: "US self employed tax",
        type: "us_self_tax",
        amount: 0,
        note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
      });
    }
  } else {
    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total tax",
      type: `additional_${scenario}`,
      amount: totalTax + socials,
    });
    reportItems.push({
      reportId: 0,
      incomeMaker: 0,
      label: "Total net income",
      type: `additional_${scenario}`,
      amount: net + spouseSalary.net,
    });
  }

  return reportItems;
}

function getSingleEarnerTaxItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption
) {
  const index = 0;
  const income = reportUserData.incomes[index];
  const expenses = income.expensesCost + income.accountantCost;
  const socials = 0.283 * 550 * 12;
  const taxableBase = income.income - expenses - socials;

  const corporateTax = taxableBase * 0.1;
  const taxCredit = 0;
  const netProfit = taxableBase - corporateTax - taxCredit;
  const withholdingTax = netProfit * 0.05;
  const totalTax = corporateTax + withholdingTax - taxCredit;

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
            label: "Tax reductions",
            type: "reduction",
            amount: 0,
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
            label: "Corporate income tax",
            type: "income_tax",
            amount: corporateTax,
          },
          {
            label: "Withholding tax",
            type: "dividend_tax",
            amount: withholdingTax,
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
            label: "EOOD SINGLE",
            type: "tax_type",
            amount: 0,
            note: "",
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

function getSingleEarnerTaxItemsSelf(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st",
  index: number
) {
  const income = reportUserData.incomes[index];
  const expenses = income.expensesCost + income.accountantCost;
  const gross = income.income;
  const socials = getSelfEmployedSocials(gross);
  const taxableBase = gross * 0.75;
  const childrenReduction = getTaxReduction(reportUserData.dependents);
  const stateTax = (taxableBase - childrenReduction) * 0.1;

  const effectiveRate = Math.max(0, (socials + stateTax) / income.income);

  const net = gross - stateTax - socials - expenses;

  const federalTax = calculateFederalIncomeTax({
    income: gross,
    taxPaidAbroad: stateTax,
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
            label: "Tax reductions",
            type: "reduction",
            amount: 0,
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
            label: "Total income tax",
            type: "total_tax",
            amount: stateTax,
          },
          {
            label: "Total tax credit",
            type: "tax_credit",
            amount: 0,
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
            label: "Freelancer",
            type: "tax_type",
            amount: 0,
            note: "",
          },
        ]
      : [
          {
            label: "Total tax",
            type: `additional_${scenario}`,
            amount: stateTax + socials,
          },
          {
            label: "Total net income",
            type: `additional_${scenario}`,
            amount: net,
          },
        ];

  return packageReportItems(prepItems, index);
}

function getDoubleEarnersSelfTaxItems(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) {
  const items: CreateReportItemDto[] = [];
  reportUserData.incomes.forEach((_, index) => {
    const costItems = getSingleEarnerTaxItemsSelf(
      reportUserData,
      eurRate,
      scenario,
      index
    );
    items.push(...costItems);
  });

  return items;
}

function getSingleYearTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) {
  const reportItems: CreateReportItemDto[] = [];

  if (reportUserData.incomes.length === 1) {
    const selfItems = getSingleEarnerTaxItemsSelf(
      reportUserData,
      eurRate,
      scenario,
      0
    );
    const corpItems = getSingleEarnerTaxItems(
      reportUserData,
      eurRate,
      scenario
    );

    const selfNet = selfItems.find((item) => item.type === "net" || item.label === 'Total net income')?.amount || 1;
    const corpNet = corpItems.find((item) => item.type === "net" || item.label === 'Total net income')?.amount || 1;

    if (selfNet >= corpNet) {
      reportItems.push(...selfItems);
    } else {
      reportItems.push(...corpItems);
    }
  } else {
    const selfItems = getDoubleEarnersSelfTaxItems(
      reportUserData,
      eurRate,
      scenario
    );
    const corpItems = getDoubleEarnerTaxItems(
      reportUserData,
      eurRate,
      scenario
    );
    const selfItemsNet = getDoubleNet(selfItems);
    const corpItemsNet = getDoubleNet(corpItems);

    if (selfItemsNet >= corpItemsNet) {
      reportItems.push(...selfItems);
    } else {
      reportItems.push(...corpItems);
    }
  }

  return reportItems;
}

export function calculateBulgariaTax(
  reportUserData: ReportUserDataDto,
  eurRate: number,
  country: string,
) {
  const first = getSingleYearTax(reportUserData, eurRate);
  const second = getSingleYearTax(reportUserData, eurRate, "2nd");
  const third = getSingleYearTax(reportUserData, eurRate, "3rd");

  return [...first, ...second, ...third];
}
