import type { DependentsDto, ReportUserDataDto } from "../reports/reports.dto";
import type { TaxConfig, TaxRules } from "./taxes.types";

export interface USData {
  amount: number;
  comment: string;
}

export interface TaxDataStore {
  grossIncome: number;
  totalExpenses: number;
  socials: number;
  newSelfEmployedReduction: number;
  assumedCostReduction: number;
  taxableIncome: number;
  totalAllowance: number;
  stateTaxAllowance: number;
  regionalTaxAllowance: number;
  stateTax: number;
  regionalTax: number;
  municipalTax: number;
  additionalTax: number;
  taxCredit: number;
  totalHealth: number;
  minSalaryYear: number;
  salarySocials: number;
  salaryTax: number;
  corporateTax: number;
  withholdingTax: number;

  // --- Final Metrics (Written by Finalizers) ---
  totalTax: number;
  net: number;
  netIncome: number;
  effectiveTaxRate: number;
  federalTax?: USData;
  usSelfEmployedTaxNote?: USData;
}

export type TaxProcessor<S, U> = (service: S, unit: U) => void;

export interface InitServiceContract {
  setTotalExpenses(totalExpenses: number): void;
  setGrossIncome(grossIncome: number): void;
}

export interface InitUnitContract {
  totalExpenses: number;
  grossIncome: number;
}

export interface SocialServiceContract {
  getGrossIncome(): number;
  getTotalExpenses(): number;
  getSalarySocials(): number;
  setSocials(amount: number): void;
}

export interface SocialUnitContract {
  age: number;
  rules: TaxRules;
  year: number;
  dependents: DependentsDto[];
}

export interface TaxableIncomeServiceContract {
  getGrossIncome(): number;
  getTotalExpenses(): number;
  getMinAnnualSalary(): number;
  getSocials(): number;
  setTaxableIncome(amount: number): void;
  setAssumedCostReduction(amount: number): void;
  setNewSelfEmployedReduction(amount: number): void;
}

export interface TaxableIncomeUnitContract {
  age: number;
  rules: TaxRules;
  year: number;
  kids: number;
  isForJoint: boolean;
  reportUserData: ReportUserDataDto;
  config: TaxConfig;
}

export interface AllowanceServiceContract {
  setTotalAllowance(amount: number): void;
}

export interface AllowanceUnitContract {
  index: number;
  rules: TaxRules;
  year: number;
  reportUserData: ReportUserDataDto;
}

export interface RegionalTaxServiceContract {
  getTaxableIncome(): number;
  getTotalAllowance(): number;
  setRegionalTax(amount: number): void;
  setRegionalTaxAllowance(amount: number): void;
}

export interface RegionalTaxUnitContract {
  rules: TaxRules;
  country: string;
  cityId: number;
}

export interface StateTaxServiceContract {
  getTaxableIncome(): number;
  getTotalAllowance(): number;
  setStateTax(amount: number): void;
  setStateTaxAllowance(amount: number): void;
  setCorporateTax(amount: number): void;
  setWithholdingTax(amount: number): void;
}

export interface StateTaxUnitContract {
  rules: TaxRules;
  country: string;
  cityId: number;
}

export interface MunicipalTaxServiceContract {
  getTaxableIncome(): number;
  setMunicipalTax(amount: number): void;
}

export interface AdditionalTaxUnitContract {
  rules: TaxRules;
  age: number;
  dependents: number;
}
export interface AdditionalTaxServiceContract {
  setAdditionalTax(amount: number): void;
  getTaxableIncome(): number;
  getStateTax(): number;
  getSalaryDiff(): number;
}

export interface MunicipalTaxUnitContract {
  rules: TaxRules;
}

export interface HealthServiceContract {
  getGrossIncome(): number;
  getTotalExpenses(): number;
  setHealth(amount: number): void;
}

export interface HealthUnitContract {
  rules: TaxRules;
  age: number;
}

export interface TaxCreditsServiceContract {
  getTaxableIncome(): number;
  setTaxCredits(amount: number): void;
}

export interface TaxCreditsUnitContract {
  rules: TaxRules;
  year: number;
  isForJoint: boolean;
  incomesLength: number;
  reportUserData: ReportUserDataDto;
}

export interface SalaryServiceContract {
  setSalaryData(
    minSalaryYear: number,
    salarySocials: number,
    salaryTax: number
  ): void;
}

export interface SalaryUnitContract {
  rules: TaxRules;
  country: string;
}

export interface FinalValues {
  grossIncome: number;
  totalExpenses: number;
  socials: number;
  totalHealth: number;
  municipalTax: number;
  stateTax: number;
  regionalTax: number;
  taxCredit: number;
  salaryTax: number;
  additionalTax: number;
  salaryDiff: number;
  salaryContributions: number;
}

export interface FinalValuesServiceContract {
  getFinalValues(): FinalValues;
  setNet(amount: number): void;
  setNetIncome(amount: number): void;
  setTotalTax(amount: number): void;
  setEffectiveTaxRate(amount: number): void;
}

export interface FinalValuesUnitContract {
  rules: TaxRules;
}

export interface USServiceContract {
  getGrossIncome(): number;
  getTotalTax(): number;
  getSocials(): number;
  setUSData(
    federalTax: USData | undefined,
    selfEmployedTax: USData | undefined
  ): void;
}

export interface USUnitContract {
  isUSCitizen: boolean;
  eurRate: number;
}

export interface ReportStoreValues {
  grossIncome: number;
  totalExpenses: number;
  socials: number;
  totalHealth: number;
  taxableIncome: number;
  municipalTax: number;
  stateTax: number;
  regionalTax: number;
  totalTax: number;
  effectiveRate: number;
  taxCredit: number;
  federalTax: USData;
  usSelfEmployedTaxNote: USData;
  netIncome: number;
  stateTaxAllowance: number;
  regionalTaxAllowance: number;
  effectiveTaxRate: number;
  totalAllowance: number;
  assumedCostReduction: number;
  salarySocials: number;
  salaryTax: number;
  minSalaryYear: number;
  corporateTax: number;
  withholdingTax: number;
}

export interface ReportItemsServiceContract {
  getReportItemValues(): ReportStoreValues;
}
