import type { ReportUserDataDto } from "../../reports/reports.dto";
import type { TaxRules } from "../../types/taxes.types";

function evaluateMathString(
  expression: string,
  variables: Record<string, number>
): number {
  const varNames = Object.keys(variables);
  const varValues = Object.values(variables);

  const functionBody = `return ${expression};`;

  try {
    const mathFunction = new Function(...varNames, functionBody);

    const result = mathFunction(...varValues);

    if (typeof result === "number" && !isNaN(result)) {
      return result;
    }

    throw new Error("Expression executed but did not return a valid number.");
  } catch (error) {
    console.error(`Error executing math expression: ${expression}`);
    console.error(error);
    return 0;
  }
}

function getMaternityCredit(
  reportUserData: ReportUserDataDto,
  addition: number,
  rules: TaxRules
) {
  if (rules.credit.items.workingMom === 0) return 0;
  const isBaby = reportUserData.dependents.find(
    (item) =>
      (item.age || rules.allowance.extraKidLimit + 1) + addition <
        rules.allowance.extraKidLimit && item.type === "kid"
  );
  if (isBaby) {
    return rules.credit.items.workingMom;
  }

  return 0;
}

function calculateCreditCap(
  rules: TaxRules,
  taxableBase: number,
  isJoint: boolean
) {
  const limit = isJoint
    ? rules.credit.caps.incomeLimitJoint
    : rules.credit.caps.incomeLimit;
  const decrease = isJoint
    ? rules.credit.caps.decreaseJoint
    : rules.credit.caps.decrease;
  const multiplier = isJoint
    ? rules.credit.caps.multiplierJoint
    : rules.credit.caps.multiplier;

  const creditsCap =
    taxableBase > limit
      ? rules.credit.caps.aboveLimit
      : rules.credit.caps.aboveLimit +
        multiplier * (1 - (taxableBase - decrease) / (limit - decrease));

  return creditsCap;
}

function getCustomCredit(rules: TaxRules, reportUserData: ReportUserDataDto) {
  if (
    rules.credit.items.spouse &&
    reportUserData.dependents.find(
      (item) => item.isDependent && item.type === "spouse"
    )
  ) {
    let result = 0;
    reportUserData.incomes.forEach((item) => {
      const credit = evaluateMathString(rules.credit.items.spouse!, {
        income: item.income,
      });
      result = credit + result;
    });

    return result;
  }

  return 0;
}

export function getTaxCredits(
  rules: TaxRules,
  reportUserData: ReportUserDataDto,
  year: number,
  taxableIncome: number,
  isJoint = false
) {
  const maternityCredit = getMaternityCredit(reportUserData, year, rules);
  const dependentCredit =
    rules.credit.items.dependent * reportUserData.dependents.length;
  const customCredit = getCustomCredit(rules, reportUserData);

  const credit =
    customCredit +
    maternityCredit +
    dependentCredit +
    rules.credit.items.household +
    rules.credit.items.healthAndEdu;
  const creditCap =
    rules.credit.type === "calculated"
      ? calculateCreditCap(rules, taxableIncome, isJoint)
      : 10000000;

  return Math.min(creditCap, credit);
}