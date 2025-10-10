import type { TaxConfig, TaxRules } from "../../types/taxes.types";

const spainRules: TaxRules = {
  tax: {
    type: "progressive",
    level: "regional,state",
    regionalExclusivity: true,
    taxableIncomeSequence:
      "expensesReduction,socialsReduction,allowNewCompanyReduction,allowAssumedCostReduction",
  },

  reduction: {
    newCompany: {
      allow: true,
      type: "percentage",
      reduction: 0.2,
      maxReduction: 20000,
      yearLength: 2,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0.07,
      maxReduction: 2000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
    },
  },

  credit: {
    allow: true,
    type: "simple",
    items: {
      workingMom: 1200,
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
  },

  social: {
    type: "progressive",
    baseType: "incomeMinusAllExpenses",
    allowDiscount: true,
    rateIndex: 0.93,
    rate: 1,
    discountedAmount: 980,
    discountLength: 1,
    maxCap: 1000000,
  },

  allowance: {
    allow: true,
    allowSpouse: true,
    allowKids: true,
    allowExtraKid: true,
    personal: 5550,
    dependentSpouse: 3400,
    dependentKids: [2400, 2700, 4000, 4500],
    extraKid: 2800,
    extraKidLimit: 3,
    useType: "taxed and reduced",
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
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
  tax: {
    type: "progressive",
    level: "state",
    regionalExclusivity: false,
    taxableIncomeSequence:
      "allowAssumedCostReduction,socialsReduction,allowPersonalReduction,allowAgeReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0.25,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 4462,
      age: 35,
      ageCap: 28737.5,
    },
  },

  credit: {
    allow: true,
    type: "calculated",
    items: {
      workingMom: 0,
      household: 250,
      dependent: 600,
      healthAndEdu: 300,
    },
    caps: {
      incomeLimit: 80000,
      incomeLimitJoint: 120000,
      aboveLimit: 1000,
      multiplier: 1500,
      decrease: 8059,
      multiplierJoint: 4000,
      decreaseJoint: 25656,
    },
  },

  social: {
    type: "flat",
    baseType: "income",
    allowDiscount: true,
    rateIndex: 0.7,
    rate: 0.214,
    discountedAmount: 0,
    discountLength: 1,
    maxCap: 16100,
  },

  allowance: {
    allow: true,
    allowSpouse: false,
    allowKids: false,
    allowExtraKid: false,
    personal: 0,
    dependentSpouse: 0,
    dependentKids: [0],
    extraKid: 0,
    extraKidLimit: 0,
    useType: "no allowance",
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
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
      name: "Organized",
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
        tax: {
          ...portugalRules.tax,
          taxableIncomeSequence:
            "expensesReduction,socialsReduction,allowPersonalReduction,allowAgeReduction",
        },
      },
    },
  ],
  extras: {
    jointFilingBenefits: true,
  },
};

export const italyFlatRules: TaxRules = {
  tax: {
    type: "flat",
    level: "state",
    rate: 0.15,
    other: {
      newRate: 0.05,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "allowAssumedCostReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0,
      maxReduction: 200000000,
      workTypeReductions: {
        software: 0.33,
        other: 0.22,
        ecommerce: 0.6,
        dropship: 0.38,
      },
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
    },
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "taxIncome",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0.26,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000000,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};
export const italyImpatriRules: TaxRules = {
  tax: {
    type: "progressive",
    level: "state,regional",
    other: {
      municipal: 0.005,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "expensesReduction,specialImpatriReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0.5,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
      kids: 0.6,
    },
  },

  credit: {
    allow: false,
    type: "none",
    items: {
      workingMom: 0,
      household: 0,
      dependent: 0,
      healthAndEdu: 0,
      spouse: "800 - 110 * (income / 15000)",
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
  },

  social: {
    type: "flat",
    baseType: "taxIncome",
    allowDiscount: false,
    rateIndex: 12,
    rate: 0.26,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000000,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const italyOrdinaryRules: TaxRules = {
  tax: {
    type: "progressive",
    level: "state,regional",
    other: {
      municipal: 0.005,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "expensesReduction,socialsReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
    },
  },

  credit: {
    allow: false,
    type: "none",
    items: {
      workingMom: 0,
      household: 0,
      dependent: 0,
      healthAndEdu: 0,
      spouse: "800 - 110 * (income / 15000)",
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
  },

  social: {
    type: "flat",
    baseType: "incomeMinusAllExpenses",
    allowDiscount: false,
    rateIndex: 12,
    rate: 0.26,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000000,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const italyConfig: TaxConfig = {
  country: "Italy",
  regimes: [
    {
      name: "Flat Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "flat_1",
            subject: "income",
            operation: "LESS THAN",
            condition: 85000.01,
            conditionType: "number",
            object: "",
          },
          {
            name: "flat_2",
            subject: "expenses",
            operation: "LESS THAN",
            condition: 0.22,
            conditionType: "percentage",
            object: "income",
          },
        ],
      },
      rules: italyFlatRules,
    },
    {
      name: "Impatriate Regime",
      conditions: {
        type: "OR",
        list: [
          {
            name: "impatriate_1",
            subject: "isSpecialist",
            operation: "EQUALS",
            condition: 1,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: {
        ...italyImpatriRules,
      },
    },
    {
      name: "Ordinary Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "flat_1",
            subject: "income",
            operation: "MORE THAN",
            condition: 85000,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: italyOrdinaryRules,
    },
  ],
  extras: {
    jointFilingBenefits: false,
  },
};

export const czechFlatRules: TaxRules = {
  tax: {
    type: "fixedProgressive",
    level: "state",
    other: {
      fixed: [
        { maxIncome: 40500, taxAmount: 350 },
        { maxIncome: 61000, taxAmount: 680 },
        { maxIncome: Number.MAX_SAFE_INTEGER, taxAmount: 1100 },
      ],
      rate: "monthly",
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: false,
      type: "percentage",
      reduction: 0,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: false,
      personal: 0,
      age: 0,
      ageCap: 0,
    },
  },

  credit: {
    allow: false,
    type: "none",
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
  },

  social: {
    type: "none",
    baseType: "",
    allowDiscount: false,
    rateIndex: 0,
    rate: 0,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000000,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const czechRegularRules: TaxRules = {
  tax: {
    type: "progressive",
    level: "state",
    regionalExclusivity: false,
    taxableIncomeSequence: "allowAssumedCostReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0.6,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
    },
  },

  credit: {
    allow: true,
    type: "income",
    items: {
      workingMom: 0,
      household: 0,
      dependent: 0,
      healthAndEdu: 0,
      personal: 1260,
      kids: {
        limit: 3,
        amounts: [620, 910, 1135, 1135, 1135],
        dependentSpouse: 1015,
      },
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
  },

  social: {
    type: "flat",
    baseType: "taxIncomeAndRate",
    allowDiscount: false,
    rateIndex: 0.55,
    rate: 0.292,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 0,
    maxCapBase: 91385,
    minCap: 2335,
  },

  health: {
    type: "flat",
    baseType: "taxIncomeAndRate",
    rateIndex: 0.5,
    rate: 0.135,
    maxCap: 0,
    maxCapBase: 1000000,
    minCap: 1540,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const czechConfig: TaxConfig = {
  country: "Czech Republic",
  regimes: [
    {
      name: "Flat Czech Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "flat_1",
            subject: "income",
            operation: "LESS THAN",
            condition: 81000.01,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: czechFlatRules,
    },
    {
      name: "Progressive tax Czech Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "regular_1",
            subject: "income",
            operation: "MORE THAN",
            condition: 81000.009,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: czechRegularRules,
    },
  ],
  extras: {
    jointFilingBenefits: false,
  },
};

export const bulgariaEOODDOUBLERules: TaxRules = {
  tax: {
    type: "corporateSuccessive",
    level: "state",
    rate: 0.1,
    other: {
      withholdingTax: 0.05,
    },
    regionalExclusivity: false,
    taxableIncomeSequence:
      "expensesReduction,socialsReduction,minSalaryReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: false,
      type: "percentage",
      reduction: 0,
      maxReduction: 0,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
      kids: 3070,
    },
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "flat",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0.283,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000,
    baseAmount: 550,
    baseFrequency: "monthly",
  },

  allowance: {
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
  },

  salary: {
    salaryContributionsRate: 0.328,
    salaryUntaxedPart: 0,
    salaryTax: 0.1,
    salaryMinimum: 550,
    salaryAverageAnnual: 10850,
  },

  finals: {
    totalTax: "stateTax + salaryContributions - taxCredit",
    net: "taxableIncome - stateTax + salaryDiff",
    netIncome: "taxableIncome - stateTax + salaryDiff",
  },
};

export const bulgariaEOODRules: TaxRules = {
  tax: {
    type: "corporateSuccessive",
    level: "state",
    rate: 0.1,
    other: {
      withholdingTax: 0.05,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "expensesReduction,socialsReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: false,
      type: "percentage",
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
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "flat",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0.283,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000,
    baseAmount: 550,
    baseFrequency: "monthly",
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const bulgariaFreelancerRules: TaxRules = {
  tax: {
    type: "flat",
    level: "state",
    rate: 0.1,
    regionalExclusivity: false,
    taxableIncomeSequence: "allowAssumedCostReduction,kidsReduction",
  },

  reduction: {
    newCompany: {
      allow: false,
      type: "none",
      reduction: 0,
      maxReduction: 0,
      yearLength: 0,
    },
    assumedCost: {
      allow: true,
      type: "percentage",
      reduction: 0.25,
      maxReduction: 200000000,
      workTypeReductions: {},
    },
    other: {
      allow: true,
      personal: 0,
      age: 0,
      ageCap: 0,
      kids: 3070,
    },
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "incomeBetweenMaxMin",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0.32,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000,
    maxCapBase: 25200,
    minCapBase: 6600,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const bulgariaConfig: TaxConfig = {
  country: "Bulgaria",
  regimes: [
    {
      name: "EOOD DOUBLE",
      conditions: {
        type: "AND",
        list: [
          {
            name: "eoodDouble_1",
            subject: "incomesLength",
            operation: "EQUALS",
            condition: 2,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: bulgariaEOODDOUBLERules,
    },
    {
      name: "EOOD SINGLE",
      conditions: {
        type: "AND",
        list: [
          {
            name: "eood_1",
            subject: "income",
            operation: "LESS THAN",
            condition: 94000.01,
            conditionType: "number",
            object: "",
          },
          {
            name: "eood_2",
            subject: "incomesLength",
            operation: "EQUALS",
            condition: 1,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: bulgariaEOODRules,
    },
    {
      name: "Freelancer",
      conditions: {
        type: "AND",
        list: [
          {
            name: "freelancer_1",
            subject: "income",
            operation: "MORE THAN",
            condition: 94000.009,
            conditionType: "number",
            object: "",
          },
          {
            name: "freelancer_2",
            subject: "incomesLength",
            operation: "EQUALS",
            condition: 1,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: bulgariaFreelancerRules,
    },
  ],
  extras: {
    jointCalculation: true,
    jointFilingBenefits: false,
  },
};

export const serbiaFlatRules: TaxRules = {
  tax: {
    type: "fixedProgressive",
    level: "state",
    other: {
      fixed: [{ maxIncome: 51000, taxAmount: 360 }],
      rate: "monthly",
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "",
  },

  reduction: {
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
  },

  credit: {
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
  },

  social: {
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
  },

  allowance: {
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
  },

  finals: {
    totalTax: "municipalTax + stateTax + regionalTax - taxCredit",
    net: "grossIncome - totalExpenses - socials - totalHealth",
    netIncome:
      "(grossIncome - totalExpenses - socials - totalHealth) - (municipalTax + stateTax + regionalTax - taxCredit)",
  },
};

export const serbiaBookedRules: TaxRules = {
  tax: {
    type: "salaryMixed",
    level: "state",
    rate: 0.1,
    other: {
      allowAdditional: true,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "expensesReduction,minSalaryReduction",
  },

  reduction: {
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
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "salary",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000,
    maxCapBase: 0,
    minCapBase: 0,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "stateTax + salaryTax + additionalTax",
    net: "taxableIncome - stateTax + salaryDiff",
    netIncome: "taxableIncome - stateTax + salaryDiff - additionalTax",
  },

  salary: {
    salaryContributionsRate: 0.3775,
    salaryUntaxedPart: 243,
    salaryTax: 0.1,
    salaryMinimum: 392,
    salaryAverageAnnual: 10850,
  },
};

export const serbiaLLCRules: TaxRules = {
  tax: {
    type: "corporateSuccessive",
    level: "state",
    rate: 0.15,
    other: {
      withholdingTax: 0.15,
      allowAdditional: true,
    },
    regionalExclusivity: false,
    taxableIncomeSequence: "expensesReduction,minSalaryReduction",
  },

  reduction: {
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
  },

  credit: {
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
  },

  social: {
    type: "flat",
    baseType: "salary",
    allowDiscount: false,
    rateIndex: 1,
    rate: 0,
    discountedAmount: 0,
    discountLength: 0,
    maxCap: 100000000,
    maxCapBase: 0,
    minCapBase: 0,
  },

  allowance: {
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
  },

  finals: {
    totalTax: "stateTax + salaryTax + additionalTax",
    net: "taxableIncome - stateTax + salaryDiff",
    netIncome: "taxableIncome - stateTax + salaryDiff - additionalTax",
  },

  salary: {
    salaryContributionsRate: 0.3775,
    salaryUntaxedPart: 243,
    salaryTax: 0.1,
    salaryMinimum: 432.2,
    salaryAverageAnnual: 10850,
  },
};

export const serbiaConfig: TaxConfig = {
  country: "Serbia",
  regimes: [
    {
      name: "Flat Serbian Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "flat_1",
            subject: "isIndependent",
            operation: "EQUALS",
            condition: 1,
            conditionType: "number",
            object: "",
          },
          {
            name: "flat_2",
            subject: "income",
            operation: "LESS THAN",
            condition: 51000,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: serbiaFlatRules,
    },
    {
      name: "Bookkeeping Regime",
      conditions: {
        type: "AND",
        list: [
          {
            name: "booked_1",
            subject: "isIndependent",
            operation: "EQUALS",
            condition: 1,
            conditionType: "number",
            object: "",
          },
          {
            name: "booked_2",
            subject: "income",
            operation: "MORE THAN",
            condition: 51000,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: serbiaBookedRules,
    },
    {
      name: "LLC Regime",
      conditions: {
        type: "OR",
        list: [
          {
            name: "llc_1",
            subject: "isIndependent",
            operation: "EQUALS",
            condition: 0,
            conditionType: "number",
            object: "",
          },
        ],
      },
      rules: serbiaLLCRules,
    },
  ],
  extras: {
    jointFilingBenefits: false,
  },
};
