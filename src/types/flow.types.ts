export type currencyString = "usd" | "eur" | "gbp";

export interface PersonalIncomes {
  isUSCitizen: boolean;
  currency: currencyString;
  income: number;
}

export interface Dependents {
  type: "spouse" | "kid";
  isDependent: boolean;
  age?: number;
}

export interface ReportUserData {
  cityId: number;
  isWorkingMom: boolean;
  dependents: Dependents[];
  incomes: PersonalIncomes[];
}

export interface Allowance {
  type: string;
  amount: number;
  incomeIndex?: number;
}

export type TaxBracket = {
  from: number;
  to: number;
  rate: number;
};

export interface TaxAnalytic {
  income: number;
  totalTax: number;
  effectiveRate: number;
}

export type TaxResult = {
  name: string;
  amount: number;
  comment: string;
};