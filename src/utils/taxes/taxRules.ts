export interface TaxConfig {
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
  allowWorkingMomCredit: boolean;
  allowAssumedCostReduction: boolean;
  assumedCostReductionType: string;
  assumedCostReductionName: string;
  assumedCostReduction: number;
  assumedCostMaxReduction: number;
  allowanceUseType: string;
  incomeTaxType: string;
  taxableIncomeSequence: string;
  incomeTaxLevels: string;
}

export const spainConfig = {
  incomeTaxType: "progressive",
  incomeTaxLevels: "regional,state",
  taxableIncomeSequence: "allowNewCompanyReduction,allowAssumedCostReduction",

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

  allowTaxCredit: true,
  allowWorkingMomCredit: true,
  workingMomCredit: 1200,

  allowSocialDiscount: true,
  socialTaxType: "progressive",
  socialBaseType: "incomeMinusAllExpenses",
  socialBaseRateIndex: 0.93,
  socialRate: 1,
  socialDiscountedAmount: 980,
  socialDiscountLength: 1,

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
