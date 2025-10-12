import type {
  DependentsDto,
  ReportUserDataDto,
} from "../../reports/reports.dto";
import type { TaxRules } from "../../types/taxes.types";
import type { FinalValues, TaxDataStore } from "../../types/taxProcessing.types";

export function executeCalcString(
  expression: string,
  variables: TaxDataStore | Record<string, number> | FinalValues,
): number {
  const varNames = Object.keys(variables);
  const varValues = Object.values(variables);

  const functionBody = `return ${expression};`;

  const mathFunction = new Function(...varNames, functionBody);

  const result = mathFunction(...varValues);

  if (typeof result === "number" && !isNaN(result)) {
    return result;
  }

  throw new Error("Expression executed but did not return a valid number.");
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
      const credit = executeCalcString(rules.credit.items.spouse!, {
        income: item.income,
      });
      result = credit + result;
    });

    return result;
  }

  return 0;
}

function getKidsCredit(rules: TaxRules, dependents: DependentsDto[]) {
  if (rules.credit.items.kids) {
    const { limit, amounts, dependentSpouse } = rules.credit.items.kids;
    let credit = 0;
    let kids = 0;

    dependents.forEach((item) => {
      if (item.type === "kid" && (item.age || 4) < (limit || 0)) {
        credit = credit + amounts[kids];
        kids++;
      }
    });

    if (
      dependentSpouse &&
      dependents.find((item) => item.type === "spouse" && item.isDependent) &&
      kids > 0
    ) {
      credit = credit + dependentSpouse;
    }

    return credit;
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
  const kidsCredit = getKidsCredit(rules, reportUserData.dependents);

  const credit =
    kidsCredit +
    customCredit +
    maternityCredit +
    dependentCredit +
    (rules.credit.items.personal || 0) +
    rules.credit.items.household +
    rules.credit.items.healthAndEdu;
  const creditCap =
    rules.credit.type === "calculated"
      ? calculateCreditCap(rules, taxableIncome, isJoint)
      : 10000000;

  return Math.min(creditCap, credit);
}
