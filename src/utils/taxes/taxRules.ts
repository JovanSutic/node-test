export interface TaxRules {
  allowAllowance: boolean;
  allowSpouseAllowance: boolean;
  allowKidsAllowance: boolean;
  allowExtraKidAllowance: boolean;
  personalAllowance: number;
  dependentSpouseAllowance: number;
  dependentKid1: number;
  dependentKid2: number;
  dependentKid3: number;
  dependentKid4: number;
  extraKidAllowance: number;
  extraKidAllowanceLimit: number;
  socialTaxType: string;
  socialBaseType: string;
  socialBaseRateIndex: number;
  socialRate: number;
  workingMomCredit: number;
  socialDiscountedAmount: number;
  socialDiscountLength: number;
  allowSocialDiscount: boolean;
  allowNewCompanyReduction: boolean;
  newCompanyReductionType: string;
  newCompanyReductionLength: number;
  newCompanyReduction: number;
  newCompanyMaxReduction: number;
  allowTaxCredit: boolean;
  allowAssumedCostReduction: boolean;
  assumedCostReductionType: string;
  assumedCostReductionName: string;
  assumedCostReduction: number;
  assumedCostMaxReduction: number;
  allowanceUseType: string;
  incomeTaxType: string;
  taxableIncomeSequence: string;
  incomeTaxLevels: string;
  allowOtherReductions: boolean;
  personalReduction: number;
  allowAgeReduction: boolean;
  ageLimit: number;
  socialMaxCap: number;
  householdCredit: number;
  dependentCredit: number;
  healthAndEduCredit: number;

  creditIncomeLimit: number;
  creditIncomeLimitJoint: number;
  creditCapForAboveLimit: number;
  creditCapMultiplier: number;
  creditCapDecrease: number;
  creditCapMultiplierJoint: number;
  creditCapDecreaseJoint: number;
  creditCapType: string;
  ageReductionCap: number;
  incomeTaxRegionalExclusivity: boolean;
}

export interface TaxConditions {
  name: string;
  subject: string;
  operation: string;
  condition: number;
  conditionType: string;
  object: string;
}

interface TaxRegime {
  name: string;
  conditions: {
    type: string;
    list: TaxConditions[];
  };
  rules: TaxRules;
}

interface TaxConfigExtra {
  jointFilingBenefits: boolean;
}
export interface TaxConfig {
  country: string;
  regimes: TaxRegime[];
  extras: TaxConfigExtra;
}

const spainRules: TaxRules = {
  incomeTaxType: "progressive",
  incomeTaxLevels: "regional,state",
  incomeTaxRegionalExclusivity: true,
  taxableIncomeSequence:
    "expensesReduction,socialsReduction,allowNewCompanyReduction,allowAssumedCostReduction",

  allowNewCompanyReduction: true,
  newCompanyReductionType: "percentage",
  newCompanyReduction: 0.2,
  newCompanyMaxReduction: 20000,
  newCompanyReductionLength: 2,

  allowAssumedCostReduction: true,
  assumedCostReductionType: "percentage",
  assumedCostReductionName: "unjustified cost",
  assumedCostReduction: 0.07,
  assumedCostMaxReduction: 2000,

  allowOtherReductions: true,
  personalReduction: 0,
  allowAgeReduction: false,
  ageLimit: 0,
  ageReductionCap: 0,

  allowTaxCredit: true,
  creditCapType: "simple",
  workingMomCredit: 1200,
  householdCredit: 0,
  dependentCredit: 0,
  healthAndEduCredit: 0,
  creditIncomeLimit: 0,
  creditIncomeLimitJoint: 0,
  creditCapForAboveLimit: 0,
  creditCapMultiplier: 0,
  creditCapDecrease: 0,
  creditCapMultiplierJoint: 0,
  creditCapDecreaseJoint: 0,

  allowSocialDiscount: true,
  socialTaxType: "progressive",
  socialBaseType: "incomeMinusAllExpenses",
  socialBaseRateIndex: 0.93,
  socialRate: 1,
  socialDiscountedAmount: 980,
  socialDiscountLength: 1,
  socialMaxCap: 1000000,

  allowAllowance: true,
  allowSpouseAllowance: true,
  allowKidsAllowance: true,
  allowExtraKidAllowance: true,
  personalAllowance: 5550,
  dependentSpouseAllowance: 3400,
  dependentKid1: 2400,
  dependentKid2: 2700,
  dependentKid3: 4000,
  dependentKid4: 4500,
  extraKidAllowance: 2800,
  extraKidAllowanceLimit: 3,
  allowanceUseType: "taxed and reduced",
};

export const spainConfig: TaxConfig = {
  country: "Spain",
  regimes: [
    {
      name: "Autonomo",
      conditions: {
        type: "none",
        list: [
          {
            name: "none",
            subject: "expenses",
            operation: "MORE THAN",
            condition: 0.25,
            conditionType: "percentage",
            object: "income",
          },
        ],
      },
      rules: spainRules,
    },
  ],
  extras: {
    jointFilingBenefits: false,
  },
};

export const portugalRules: TaxRules = {
  incomeTaxType: "progressive",
  incomeTaxLevels: "state",
  incomeTaxRegionalExclusivity: false,
  taxableIncomeSequence:
    "allowAssumedCostReduction,socialsReduction,allowPersonalReduction,allowAgeReduction",

  allowNewCompanyReduction: false,
  newCompanyReductionType: "none",
  newCompanyReduction: 0,
  newCompanyMaxReduction: 0,
  newCompanyReductionLength: 0,

  allowAssumedCostReduction: true,
  assumedCostReductionType: "percentage",
  assumedCostReductionName: "simplified regime",
  assumedCostReduction: 0.25,
  assumedCostMaxReduction: 200000000,

  allowOtherReductions: true,
  personalReduction: 4462,
  allowAgeReduction: true,
  ageLimit: 35,
  ageReductionCap: 28737.5,

  allowTaxCredit: true,
  creditCapType: "calculated",
  workingMomCredit: 0,
  householdCredit: 250,
  dependentCredit: 600,
  healthAndEduCredit: 300,
  creditIncomeLimit: 80000,
  creditIncomeLimitJoint: 120000,
  creditCapForAboveLimit: 1000,
  creditCapMultiplier: 1500,
  creditCapDecrease: 8059,
  creditCapMultiplierJoint: 4000,
  creditCapDecreaseJoint: 25656,

  allowSocialDiscount: true,
  socialTaxType: "flat",
  socialBaseType: "income",
  socialBaseRateIndex: 0.7,
  socialRate: 0.214,
  socialDiscountedAmount: 0,
  socialDiscountLength: 1,
  socialMaxCap: 16100,

  allowAllowance: false,
  allowSpouseAllowance: false,
  allowKidsAllowance: false,
  allowExtraKidAllowance: false,
  personalAllowance: 0,
  dependentSpouseAllowance: 0,
  dependentKid1: 0,
  dependentKid2: 0,
  dependentKid3: 0,
  dependentKid4: 0,
  extraKidAllowance: 0,
  extraKidAllowanceLimit: 0,
  allowanceUseType: "no allowance",
};

export const portugalConfig: TaxConfig = {
  country: "Portugal",
  regimes: [
    {
      name: "Simplified",
      conditions: {
        type: "AND",
        list: [
          {
            name: "simplified_1",
            subject: "income",
            operation: "LESS THAN",
            condition: 200000,
            conditionType: "number",
            object: "",
          },
          {
            name: "simplified_2",
            subject: "expenses",
            operation: "LESS THAN",
            condition: 0.25,
            conditionType: "percentage",
            object: "income",
          },
        ],
      },
      rules: portugalRules,
    },
    {
      name: "Organized Regime",
      conditions: {
        type: "OR",
        list: [
          {
            name: "organized_1",
            subject: "income",
            operation: "MORE THAN",
            condition: 200000,
            conditionType: "number",
            object: "",
          },
          {
            name: "organized_2",
            subject: "expenses",
            operation: "MORE THAN",
            condition: 0.25,
            conditionType: "percentage",
            object: "income",
          },
        ],
      },
      rules: {
        ...portugalRules,
        taxableIncomeSequence:
          "expensesReduction,socialsReduction,allowPersonalReduction,allowAgeReduction",
      },
    },
  ],
  extras: {
    jointFilingBenefits: true,
  },
};

