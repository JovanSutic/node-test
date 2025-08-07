import type { CreateReportItemDto, ReportUserDataDto } from "../../reports/reports.dto";
import type {
  Allowance,
  Dependents,
  PersonalIncomes,
  TaxAnalytic,
  TaxResult,
} from "../../types/flow.types";
import { calculateUSTax, getProgressiveTax } from "../saveFlow";

const allowanceLabelMap = {
  spouse: "Allowance for dependent spouse",
  kid: "Allowance for dependent kid",
  "kid-extra": "Additional allowance for kid under 3",
  maternity: "Allowance for maternity",
};

export function calculateAllowance(data: Dependents[], isWorkingMom: boolean) {
  const result: Allowance[] = [];

  data
    .filter((item) => item.type === "kid")
    .forEach((item) => {
      if (item.isDependent) {
        const amount = [2400, 2700, 4000, 4500, 4500, 4500, 4500, 4500];
        const index = result.filter((item) => item.type === "kid").length;
        result.push({ type: "kid", amount: amount[index] });
        if ((item.age || 4) < 3) {
          result.push({ type: "kid-extra", amount: 3600 });
        }
      }
    });

  data
    .filter((item) => item.type === "spouse")
    .forEach((item) => {
      if (item.isDependent) {
        result.push({ type: "spouse", amount: 3400 });
      } else {
        result
          .filter((item) => item.type === "kid-extra")
          .forEach(() => {
            if (isWorkingMom) {
              result.push({ type: "maternity", amount: 1200 });
            }
          });
      }
    });

  return result;
}

export function distributeAllowance(
  incomes: PersonalIncomes[],
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

export const calculateSocials = (incomes: PersonalIncomes[]) => {
  const result = [];

  for (let index = 0; index < incomes.length; index++) {
    const element = incomes[index];
    if (element.income > 20000) {
      result.push(3850);
      continue;
    }
    if (element.income > 25000) {
      result.push(4200);
      continue;
    }

    result.push(3000);
  }

  return result;
};

export const calculateSpainTax = (
  reportUserData: ReportUserDataDto,
  eurRate: number,
  isPublic: boolean
) => {
  const reportItems: CreateReportItemDto[] = [];

  let federalTax: null | TaxResult[] = null;

  const additionalAllowance = calculateAllowance(reportUserData.dependents, reportUserData.isWorkingMom);
  const allowances = distributeAllowance(
    reportUserData.incomes,
    additionalAllowance
  );
  const socials = calculateSocials(reportUserData.incomes);

  const interimIncomes: TaxAnalytic[] = [];
  const accountingCost = 1600;
  reportUserData.incomes.forEach((item, index) => {
    if (!isPublic) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Personal allowance",
        type: "allowance",
        amount: 5500,
      });
    }

    allowances
      .filter((item) => item.incomeIndex === index)
      .forEach((item) => {
        if (!isPublic) {
          reportItems.push({
            reportId: 0,
            incomeMaker: index,
            label:
              allowanceLabelMap[item.type as keyof typeof allowanceLabelMap],
            type: "allowance",
            amount: item.amount,
          });
        }
      });
    const personalAllowance =
      5500 +
      allowances
        .filter((item) => item.incomeIndex === index)
        .reduce((prev, next) => prev + next.amount, 0);

    const analysis = getProgressiveTax(
      item.income - personalAllowance - accountingCost,
      "Spain"
    );
    interimIncomes.push(analysis);

    if (!isPublic) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Full allowance",
        type: "allowance",
        amount: personalAllowance,
      });
    }
  });

  if (reportUserData.incomes[0].isUSCitizen) {
    federalTax = calculateUSTax(
      reportUserData.incomes,
      interimIncomes,
      eurRate
    );
  }

  for (let index = 0; index < interimIncomes.length; index++) {
    const cost =
      interimIncomes[index].totalTax +
      accountingCost +
      (federalTax && federalTax[index] ? federalTax[index].amount : 0) +
      socials[index];
    if (!isPublic) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Accounting cost",
        type: "accounting",
        amount: accountingCost,
      });
    }

    if (federalTax && federalTax[index] && !isPublic) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "US Federal income tax",
        type: "us_income_tax",
        amount: federalTax[index].amount,
        note: federalTax[index].comment,
      });
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "US self employed tax",
        type: "us_self_tax",
        amount: 0,
        note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
      });
    }
    if (!isPublic) {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Taxable income",
        type: "taxable_income",
        amount: interimIncomes[index].income,
      });
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total income tax",
        type: "income_tax",
        amount: interimIncomes[index].totalTax,
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
        label: "Total cost of business",
        type: "business_cost",
        amount: cost,
      });
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Effective tax",
        type: "effective_tax",
        amount:
          ((cost - accountingCost) / reportUserData.incomes[index].income) *
          100,
      });
    }
    reportItems.push({
      reportId: 0,
      incomeMaker: index,
      label: "Total net income",
      type: "net",
      amount: reportUserData.incomes[index].income - cost,
    });
  }

  return reportItems;
};
