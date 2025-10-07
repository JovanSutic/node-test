import type { DependentsDto } from "../reports/reports.dto";
import type { SpainOption } from "./flow.types";

export type TaxType =  "progressive" | "flat" | "fixedProgressive" | "corporateSuccessive" | "salaryMixed";

export interface FixedProgressive {
    maxIncome: number; 
    taxAmount: number;
}

export interface TaxRulesTax {
  type: TaxType;
  level: string;
  rate?: number;
  other?: Record<string, any>,
  regionalExclusivity: boolean;
  taxableIncomeSequence: string;
}

export interface TaxRulesReductionNew {
  allow: boolean;
  type: string;
  reduction: number;
  maxReduction: number;
  yearLength: number;
}

export interface TaxRulesReductionCost {
  allow: boolean;
  type: string;
  reduction: number;
  maxReduction: number;
  workTypeReductions: {
    software?: number;
    other?: number;
    ecommerce?: number;
    dropship?: number;
  };
}

export interface TaxRulesReductionOther {
  allow: boolean;
  personal: number;
  age: number;
  ageCap: number;
  kids?: number;
}

export interface TaxRulesCredit {
  allow: boolean;
  type: string;
  items: {
    workingMom: number;
    household: number;
    dependent: number;
    healthAndEdu: number;
    spouse?: string;
    personal?: number;
    kids?: Record<string, any>;
  };
  caps: {
    incomeLimit: number;
    incomeLimitJoint: number;
    aboveLimit: number;
    multiplier: number;
    decrease: number;
    multiplierJoint: number;
    decreaseJoint: number;
  };
}

export interface TaxRulesSocial {
  type: string;
  baseType: string;
  allowDiscount: boolean;
  rateIndex: number;
  rate: number;
  discountedAmount: number;
  discountLength: number;
  maxCap: number;
  minCap?: number;
  maxCapBase?: number;
  minCapBase?: number;
  baseAmount?: number;
  baseFrequency?: 'monthly' | 'yearly'
}

export interface TaxRulesHealth {
  type: string;
  baseType: string;
  rateIndex: number;
  rate: number;
  maxCap: number;
  maxCapBase?: number;
  minCap?: number;
}

export interface TaxRulesAllowance {
  allow: boolean;
  allowSpouse: boolean;
  allowKids: boolean;
  allowExtraKid: boolean;
  personal: number;
  dependentSpouse: number;
  dependentKids: number[];
  extraKid: number;
  extraKidLimit: number;
  useType: string;
}

interface TaxRulesFinals {
  totalTax: string;
  net: string;
  netIncome: string;
}

interface TaxRulesSalary {
  salaryContributionsRate: number;
  salaryUntaxedPart: number;
  salaryTax: number;
  salaryMinimum: number;
  salaryAverageAnnual: number;
}

export interface TaxRules {
  tax: TaxRulesTax;
  reduction: {
    newCompany: TaxRulesReductionNew;
    assumedCost: TaxRulesReductionCost;
    other: TaxRulesReductionOther;
  };
  credit: TaxRulesCredit;
  social: TaxRulesSocial;
  allowance: TaxRulesAllowance;
  health?: TaxRulesHealth;
  finals: TaxRulesFinals;
  salary?: TaxRulesSalary;
}

export interface TaxConditions {
  name: string;
  subject: string;
  operation: string;
  condition: number;
  conditionType: string;
  object: string;
}

export interface TaxRegime {
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

export interface IncomeBasics {
  gross: number;
  expenses: number;
  socials: number;
  kids?: number;
  minSalary?: number;
}

export interface TaxAdditions {
  age: number;
}
