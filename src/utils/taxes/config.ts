import type { PersonalIncomesDto } from "../../reports/reports.dto";
import type { TaxConditions, TaxConfig, TaxRegime } from "../../types/taxes.types";
import { czechConfig, italyConfig, portugalConfig, spainConfig } from "./taxRules";

export function getConfig(country: string) {
  if (country === "Spain") return spainConfig;
  if (country === "Portugal") return portugalConfig;
  if (country === "Italy") return italyConfig;
  if (country === "Czech Republic") return czechConfig;

  return null;
}

function normalizeIncomeValue(
  income: PersonalIncomesDto,
  key: keyof PersonalIncomesDto
): number {
  const value = income[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  throw new Error(
    `Unsupported income type for key '${key}'. Expected number or boolean, received: ${typeof value}.`
  );
}

function getMatchedConditionNumber(
  income: PersonalIncomesDto,
  conditions: TaxConditions[]
) {
  let result = 0;

  for (let index = 0; index < conditions.length; index++) {
    const element = conditions[index];
    const subject =
      normalizeIncomeValue(
        income,
        element.subject as keyof PersonalIncomesDto
      ) || income.accountantCost + income.expensesCost;
    const object =
      element.conditionType === "number"
        ? element.condition
        : normalizeIncomeValue(
            income,
            element.object as keyof PersonalIncomesDto
          ) * element.condition;

    if (element.operation === "LESS THAN") {
      if (subject < object) {
        result++;
        continue;
      }
    }

    if (element.operation === "MORE THAN") {
      if (subject > object) {
        result++;
        continue;
      }
    }

    if (element.operation === "EQUALS") {
      if (subject === object) {
        result++;
        continue;
      }
    }
  }

  return result;
}

function configureTaxRegimeRules(
  regime: TaxRegime,
  income: PersonalIncomesDto
) {
  const isWorkTypeConfig =
    Object.keys(regime.rules.reduction.assumedCost.workTypeReductions).length >
    0;
  const isNewRateConfig =
    regime.rules.tax.other &&
    Object.keys(regime.rules.tax.other).length > 0 &&
    regime.rules.tax.other.newRate;

  if (isWorkTypeConfig && income.workType) {
    const workTypeKey =
      income.workType as keyof typeof regime.rules.reduction.assumedCost.workTypeReductions;
    regime.rules.reduction.assumedCost.reduction =
      regime.rules.reduction.assumedCost.workTypeReductions[workTypeKey]!;
  }

  if (isNewRateConfig && income.isNew) {
    regime.rules.tax.rate = regime.rules.tax.other!.newRate;
  }

  return regime;
}

export function getConfigRegime(config: TaxConfig, income: PersonalIncomesDto) {
  if (config.regimes.length === 1) {
    return config.regimes[0];
  }
  let result = null;

  for (let index = 0; index < config.regimes.length; index++) {
    const regime = config.regimes[index];
    const conditionAssertion =
      regime.conditions.type === "AND" ? regime.conditions.list.length : 1;
    const matchedConditions = getMatchedConditionNumber(
      income,
      regime.conditions.list
    );

    if (matchedConditions >= conditionAssertion) {
      result = configureTaxRegimeRules(regime, income);
      break;
    }
  }

  return result;
}
