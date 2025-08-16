import type {
  CreateReportItemDto,
  PersonalIncomesDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type {
  Allowance,
  Dependents,
  SpainOption,
} from "../../types/flow.types";
import { calculateFederalIncomeTax, getProgressiveTax } from "../saveFlow";
import {
  regionalTaxBrackets,
  regionsSpain,
  socialBrackets,
  spanishTaxBrackets,
} from "../taxData";

export function getSpainRegionalBracket(cityId: number) {
  const region = regionsSpain[cityId.toString()];
  if (!region) {
    throw new Error("Provided city does not have the proper region");
  }

  return regionalTaxBrackets[region.region];
}

export function calculateAllowance(data: Dependents[], addition: number) {
  const result: Allowance[] = [];

  data
    .filter((item) => item.type === "kid")
    .forEach((item) => {
      if (item.isDependent) {
        const amount = [2400, 2700, 4000, 4500, 4500, 4500, 4500, 4500];
        const index = result.filter((item) => item.type === "kid").length;
        result.push({ type: "kid", amount: amount[index] });
        if ((item.age || 4) + addition < 3) {
          result.push({ type: "kid-extra", amount: 2800 });
        }
      }
    });

  data
    .filter((item) => item.type === "spouse")
    .forEach((item) => {
      if (item.isDependent) {
        result.push({ type: "spouse", amount: 3400 });
      }
    });

  return result;
}

export function distributeAllowance(
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

export const calculateSocials = (incomes: PersonalIncomesDto[]) => {
  const result = [];

  for (let index = 0; index < incomes.length; index++) {
    const base =
      ((incomes[index].income -
        (incomes[index].expensesCost + incomes[index].accountantCost)) *
        0.93) /
      12;
    const bracket = socialBrackets.find((item) => {
      if (base > item.from && base < item.to) {
        return item;
      }
    });

    result.push((bracket?.fee || 1) * 12);
  }

  return result;
};

function getMaternityCredit(
  reportUserData: ReportUserDataDto,
  addition: number
) {
  const isBaby = reportUserData.dependents.find(
    (item) => (item.age || 4) + addition < 3 && item.type === "kid"
  );
  if (isBaby && reportUserData.isWorkingMom) {
    return 1200;
  }

  return 0;
}

export const calculateSpainTaxSingle = (
  reportUserData: ReportUserDataDto,
  eurRate: number,
  scenario: SpainOption = "1st"
) => {
  const reportItems: CreateReportItemDto[] = [];
  const personalAllowance = 5550;
  const newReduction = scenario === "3rd" ? 0 : 0.2;
  const unJustifiedCostReduction = 0.07;
  const tarrifaPlana = 980;
  const kidAddition: Record<SpainOption, number> = {
    "1st": 0,
    "2nd": 1,
    "3rd": 2,
  };

  const additionalAllowance = calculateAllowance(
    reportUserData.dependents,
    kidAddition[scenario]
  );
  let maternityCheck = false;

  const allowances = distributeAllowance(
    reportUserData.incomes,
    additionalAllowance
  );

  const maternityCredit = getMaternityCredit(
    reportUserData,
    kidAddition[scenario]
  );

  const socials =
    scenario === "1st"
      ? [tarrifaPlana, tarrifaPlana]
      : calculateSocials(reportUserData.incomes);

  for (let index = 0; index < reportUserData.incomes.length; index++) {
    const income = reportUserData.incomes[index];

    const fullExpenses = income.accountantCost + income.expensesCost;
    const net = income.income - fullExpenses - socials[index];

    const reduction = Math.min(net * newReduction, 20000);
    const firstReductionNet = net - reduction;
    const justReduction = Math.min(
      firstReductionNet * unJustifiedCostReduction,
      2000
    );
    const reductionNet = firstReductionNet - justReduction;

    const totalAllowance =
      personalAllowance +
      allowances
        .filter((item) => item.incomeIndex === index)
        .reduce((prev, next) => prev + next.amount, 0);

    const taxableIncome = reductionNet - totalAllowance;

    const soleRegions = ["Navarre", "Basque Country"];

    const region = regionsSpain[reportUserData.cityId.toString()]?.region;

    const regionalBracket = getSpainRegionalBracket(reportUserData.cityId);

    const stateTax = soleRegions.includes(region)
      ? { totalTax: 0 }
      : getProgressiveTax(taxableIncome, spanishTaxBrackets);
    const regionalTax = getProgressiveTax(taxableIncome, regionalBracket);

    const taxCredit = !maternityCheck ? maternityCredit : 0;

    const netIncome =
      net - stateTax.totalTax - regionalTax.totalTax + taxCredit;

    const federalTax = calculateFederalIncomeTax({
      income: income.income,
      taxPaidAbroad: stateTax.totalTax + regionalTax.totalTax - taxCredit,
      eurRate,
    });

    if (scenario === "1st") {
      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Full business expenses",
        type: "expenses",
        amount: fullExpenses,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "New self-employed reduction",
        type: "reduction",
        amount: reduction,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Reduction for expenses difficult to justify",
        type: "reduction",
        amount: justReduction,
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
        amount: stateTax.totalTax,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Regional income tax",
        type: "income_tax",
        amount: regionalTax.totalTax,
      });

      if (taxCredit > 0) {
        reportItems.push({
          reportId: 0,
          incomeMaker: index,
          label: "Maternity tax credit",
          type: "tax_credit",
          amount: taxCredit,
        });

        maternityCheck = true;
      }

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Total income tax",
        type: "total_tax",
        amount: regionalTax.totalTax + stateTax.totalTax - taxCredit,
      });

      reportItems.push({
        reportId: 0,
        incomeMaker: index,
        label: "Effective tax",
        type: "effective_tax",
        amount:
          (regionalTax.totalTax +
            socials[index] +
            stateTax.totalTax -
            taxCredit) /
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
          note: "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in Spain, thanks to the U.S.–Spain Totalization Agreement.",
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
        amount:
          socials[index] + regionalTax.totalTax + stateTax.totalTax - taxCredit,
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
  const first = calculateSpainTaxSingle(reportUserData, eurRate);
  const second = calculateSpainTaxSingle(reportUserData, eurRate, "2nd");
  const third = calculateSpainTaxSingle(reportUserData, eurRate, "3rd");

  return [...first, ...second, ...third];
};
