import type { PersonalIncomesDto } from "../../reports/reports.dto";
import type {
  TaxConditions,
  TaxConfig,
  TaxRegime,
} from "../../types/taxes.types";
import {
  bulgariaConfig,
  czechConfig,
  italyConfig,
  portugalConfig,
  serbiaConfig,
  spainConfig,
} from "./taxRules";

export function getConfig(country: string) {
  if (country === "Spain") return spainConfig;
  if (country === "Portugal") return portugalConfig;
  if (country === "Italy") return italyConfig;
  if (country === "Czech Republic") return czechConfig;
  if (country === "Bulgaria") return bulgariaConfig;
  if (country === "Serbia") return serbiaConfig;

  return null;
}

function normalizeIncomeValue(
  income: PersonalIncomesDto,
  key: keyof PersonalIncomesDto,
  type?: string
): number | undefined {
  const value = income[key];

  if (type && type === "number" && value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  throw new Error(
    `Unsupported income type for key '${key}'. Expected number or boolean, received: ${typeof value}.`
  );
}

function getNormalizedValue(
  key: "subject" | "object",
  condition: TaxConditions,
  income: PersonalIncomesDto,
  incomesLength: number
) {
  if (key === "subject") {
    if (condition.subject === "incomesLength") return incomesLength;
    return normalizeIncomeValue(
      income,
      condition.subject as keyof PersonalIncomesDto,
      condition.conditionType
    ) !== undefined
      ? normalizeIncomeValue(
          income,
          condition.subject as keyof PersonalIncomesDto,
          condition.conditionType
        )
      : income.accountantCost + income.expensesCost;
  } else {
    if (condition.object === "incomesLength") return incomesLength;
    return condition.conditionType === "number"
      ? condition.condition
      : (normalizeIncomeValue(
          income,
          condition.object as keyof PersonalIncomesDto,
          condition.conditionType
        ) || 0) * condition.condition;
  }
}

function getMatchedConditionNumber(
  income: PersonalIncomesDto,
  conditions: TaxConditions[],
  incomesLength: number
) {
  let result = 0;

  for (let index = 0; index < conditions.length; index++) {
    const condition = conditions[index];
    const subject =
      getNormalizedValue("subject", condition, income, incomesLength) || 0;
    const object =
      getNormalizedValue("object", condition, income, incomesLength) || 0;

    if (condition.operation === "LESS THAN") {
      if (subject < object) {
        result++;
        continue;
      }
    }

    if (condition.operation === "MORE THAN") {
      if (subject > object) {
        result++;
        continue;
      }
    }

    if (condition.operation === "EQUALS") {
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

  console.log("isNewRateConfig", isNewRateConfig);

  if (isNewRateConfig && Boolean(income?.isNew)) {
    console.log(
      `config is changing to newRate which is:${
        regime.rules.tax.other?.newRate
      } and on count of isNew which is ${Boolean(income?.isNew)}`
    );
    regime.rules.tax.rate = regime.rules.tax.other?.newRate;
  }

  return regime;
}

export function getConfigRegime(
  config: TaxConfig,
  income: PersonalIncomesDto,
  incomesLength: number
) {
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
      regime.conditions.list,
      incomesLength
    );

    if (matchedConditions >= conditionAssertion) {
      result = configureTaxRegimeRules(regime, income);
      break;
    }
  }

  return result;
}
