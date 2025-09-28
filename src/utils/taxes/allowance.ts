import type { PersonalIncomesDto } from "../../reports/reports.dto";
import type { Allowance, Dependents } from "../../types/flow.types";
import type { TaxRules } from "../../types/taxes.types";

function extractKidsAllowance(rules: TaxRules) {
  const kidsAllowance: number[] = [...rules.allowance.dependentKids];

  for (let i = kidsAllowance.length; i < 10; i++) {
    if (kidsAllowance[i] === undefined) {
      kidsAllowance.push(kidsAllowance[i - 1]);
    }
  }

  return kidsAllowance;
}

export function calculateAllowance(
  data: Dependents[],
  addition: number,
  rules: TaxRules
) {
  const result: Allowance[] = [];
  if (rules.allowance.allow) {
    if (rules.allowance.allowKids) {
      data
        .filter((item) => item.type === "kid")
        .forEach((item) => {
          if (item.isDependent) {
            const amount = extractKidsAllowance(rules);
            const index = result.filter((item) => item.type === "kid").length;
            result.push({ type: "kid", amount: amount[index] });
          }
        });
    }

    if (rules.allowance.allowExtraKid) {
      data
        .filter((item) => item.type === "kid")
        .forEach((item) => {
          if (item.isDependent) {
            if (
              (item.age || rules.allowance.extraKidLimit + 1) + addition <
              rules.allowance.extraKidLimit
            ) {
              result.push({
                type: "kid-extra",
                amount: rules.allowance.extraKid,
              });
            }
          }
        });
    }

    if (rules.allowance.allowSpouse) {
      data
        .filter((item) => item.type === "spouse")
        .forEach((item) => {
          if (item.isDependent) {
            result.push({
              type: "spouse",
              amount: rules.allowance.dependentSpouse,
            });
          }
        });
    }
  }

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
