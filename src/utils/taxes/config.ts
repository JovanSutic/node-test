import { InternalServerErrorException } from "@nestjs/common";
import type { DefValueDto } from "../../def_value/def_value.dto";
import type { DefinitionDto } from "../../definition/definition.dto";
import type { PersonalIncomesDto } from "../../reports/reports.dto";
import type {
  TaxConditions,
  TaxConfig,
  TaxRegime,
  TaxRules,
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

export function decorateTaxRules(partialRules: Partial<TaxRules>) {
  if (!partialRules.reduction) {
    partialRules.reduction = {
      newCompany: {
        allow: false,
        type: "none",
        reduction: 0,
        maxReduction: 0,
        yearLength: 0,
      },
      assumedCost: {
        allow: false,
        type: "",
        reduction: 0,
        maxReduction: 0,
        workTypeReductions: {},
      },
      other: {
        allow: true,
        personal: 0,
        age: 0,
        ageCap: 0,
      },
    };
  }

  if (!partialRules.credit) {
    partialRules.credit = {
      allow: false,
      type: "",
      items: {
        workingMom: 0,
        household: 0,
        dependent: 0,
        healthAndEdu: 0,
      },
      caps: {
        incomeLimit: 0,
        incomeLimitJoint: 0,
        aboveLimit: 0,
        multiplier: 0,
        decrease: 0,
        multiplierJoint: 0,
        decreaseJoint: 0,
      },
    };
  }

  if (!partialRules.social) {
    partialRules.social = {
      type: "flat",
      baseType: "",
      allowDiscount: false,
      rateIndex: 0,
      rate: 0,
      discountedAmount: 0,
      discountLength: 0,
      maxCap: 100000000,
      maxCapBase: 0,
      minCapBase: 0,
    };
  }

  if (!partialRules.allowance) {
    partialRules.allowance = {
      allow: false,
      allowSpouse: false,
      allowKids: false,
      allowExtraKid: false,
      personal: 0,
      dependentSpouse: 0,
      dependentKids: [0],
      extraKid: 0,
      extraKidLimit: 0,
      useType: "no allowance",
    };
  }

  return partialRules as TaxRules;
}

export function parseConfig(value: string) {
  const cleanedString = value.slice(1, -1);
  const jsonObject = JSON.parse(cleanedString);

  return jsonObject;
}

type DefValueWithDefinition = DefValueDto & { definition: DefinitionDto };
type TaxRegimeUnparsed = Omit<TaxRegime, 'rules'> & {rules: number};

function createTaxConfig(configDef: DefValueWithDefinition, rulesDef: Record<string, TaxRules>) {
  const config: Record<string, any> =  parseConfig(configDef.value!);

  config.regimes.forEach((item: TaxRegimeUnparsed) => {
    (item.rules as unknown as TaxRules) = rulesDef[item.rules];
    return item;
  });

  return config as TaxConfig;
}



export function processTaxConfigStrings(defValues: DefValueWithDefinition[]) {
  const configDef: DefValueWithDefinition | undefined = defValues.find(
    (item) => item.definition.type === "country_tax_configuration"
  );

  if (!configDef) {
    throw new InternalServerErrorException(
      "Failed to find the country_tax_configuration definition value for this country."
    );
  }

  const rulesDef: DefValueWithDefinition[] = defValues.filter(
    (item) => item.definition.type !== "country_tax_configuration"
  );

  if (!rulesDef.length) {
    throw new InternalServerErrorException(
      "Failed to find the tax_regime_rules definition value for this country."
    );
  }

  const rulesRecord = rulesDef.reduce((prev: Record<string, TaxRules>, next: DefValueWithDefinition) => {
    const rule = parseConfig(next.value!);
    prev[`${rule.id}`] = decorateTaxRules(rule);
    return prev;
  }, {})

  const result = createTaxConfig(configDef, rulesRecord)

  return result;
}
