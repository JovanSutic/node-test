import type { TaxBracket } from "../../types/flow.types";
import type {
  FixedProgressive,
  TaxRules,
  TaxRulesSalary,
  TaxRulesTax,
} from "../../types/taxes.types";
import { getProgressiveTax } from "../saveFlow";
import {
  getPortugalBrackets,
  regionalTaxBrackets,
  regionalTaxBracketsItaly,
  regionsItaly,
  regionsSpain,
  spanishTaxBrackets,
  stateTaxBracketsCzech,
  stateTaxBracketsItaly,
} from "../taxData";

export function calculateAnnualPersonalIncomeTax(
  averageAnnualSalary: number,
  totalIncome: number,
  numberOfDependents: number,
  age: number
): number {
  const nonTaxableAmount = averageAnnualSalary * 3;
  const secondTaxBracketThreshold = averageAnnualSalary * 6;

  const taxpayerDeduction = 0.4 * averageAnnualSalary;
  const dependentDeduction = 0.15 * averageAnnualSalary;

  const under40Deductions = age < 40 ? nonTaxableAmount : 0;
  const personalDeductions = Math.min(
    totalIncome * 0.5,
    taxpayerDeduction + dependentDeduction * numberOfDependents
  );
  const totalDeductions = under40Deductions || personalDeductions;

  let taxableBase = 0;

  if (totalIncome <= nonTaxableAmount) {
    return 0;
  }

  const netIncomeAfterNonTaxableAmount = totalIncome - nonTaxableAmount;

  if (netIncomeAfterNonTaxableAmount <= totalDeductions) {
    taxableBase = 0;
  } else {
    taxableBase = netIncomeAfterNonTaxableAmount - totalDeductions;
  }

  if (taxableBase <= 0) {
    return 0;
  } else if (taxableBase <= secondTaxBracketThreshold - nonTaxableAmount) {
    return taxableBase * 0.1;
  } else {
    const baseFirstPart =
      secondTaxBracketThreshold - nonTaxableAmount - totalDeductions;
    const taxFirstPart = baseFirstPart * 0.1;
    const baseSecondPart = taxableBase - baseFirstPart;
    const taxSecondPart = baseSecondPart * 0.15;
    return taxFirstPart + taxSecondPart;
  }
}

export function getSoleRegionMatch(country: string, cityId: number) {
  if (country === "Spain") {
    const soleRegions = ["Navarre", "Basque Country"];
    const region = regionsSpain[cityId.toString()]?.region;
    return soleRegions.includes(region);
  }

  false;
}

export function getStateBrackets(country: string, cityId: number) {
  if (country === "Spain") return spanishTaxBrackets;
  if (country === "Portugal") return getPortugalBrackets(cityId);
  if (country === "Italy") return stateTaxBracketsItaly;
  if (country === "Czech Republic") return stateTaxBracketsCzech;

  return [];
}

export function getSpainRegionalBracket(cityId: number) {
  const region = regionsSpain[cityId.toString()];
  if (!region) {
    throw new Error("Provided city does not have the proper region");
  }

  return regionalTaxBrackets[region.region];
}

export function getRegionalBrackets(country: string, cityId: number) {
  if (country === "Spain") return getSpainRegionalBracket(cityId);
  if (country === "Italy") {
    const region = regionsItaly[cityId].region;
    return regionalTaxBracketsItaly[region];
  }

  return [];
}

export function getStateTax(taxData: {
  taxableIncome: number;
  totalAllowance: number;
  isStateTax: boolean;
  brackets: TaxBracket[];
  taxRules: TaxRulesTax;
}) {
  const { isStateTax, taxRules, taxableIncome, brackets, totalAllowance } =
    taxData;

  const { type, rate } = taxRules;

  if (isStateTax) {
    if (type === "progressive") {
      const stateTax = getProgressiveTax(taxableIncome, brackets);
      const stateAllowanceTax = getProgressiveTax(totalAllowance, brackets);

      return {
        tax: stateTax.totalTax - stateAllowanceTax.totalTax,
        allowanceTax: stateAllowanceTax.totalTax,
      };
    }
    if (type === "fixedProgressive") {
      if (taxRules.other && taxRules.other.fixed && taxRules.other.rate) {
        let multiplier = 1;
        if (taxRules.other.rate === "monthly") {
          multiplier = 12;
        }
        const bracket = taxRules.other.fixed.find(
          (item: FixedProgressive) => taxableIncome <= item.maxIncome
        );
        return {
          tax: bracket.taxAmount * multiplier,
          allowanceTax: 0,
        };
      } else {
        throw new Error(
          "Tax type fixedProgressive doesn't have needed information for calculation in the tax rules."
        );
      }
    }
    if (type === "corporateSuccessive") {
      const corporateTax = taxableIncome * rate!;
      const withholdingTax =
        (taxableIncome - corporateTax) * (taxRules.other?.withholdingTax || 0);

      return {
        tax: corporateTax + withholdingTax,
        allowanceTax: 0,
        breakdown: {
          corporateTax,
          withholdingTax,
        },
      };
    }
    return {
      tax: (rate || 0) * taxableIncome,
      allowanceTax: 0,
    };
  }

  return {
    tax: 0,
    allowanceTax: 0,
  };
}

export function getRegionalTax(
  taxableIncome: number,
  totalAllowance: number,
  regionalBrackets: TaxBracket[]
) {
  if (regionalBrackets.length) {
    const regionalTax = getProgressiveTax(taxableIncome, regionalBrackets);

    const regionalAllowanceTax = getProgressiveTax(
      totalAllowance,
      regionalBrackets
    );

    return {
      tax: regionalTax.totalTax - regionalAllowanceTax.totalTax,
      allowanceTax: regionalAllowanceTax.totalTax,
    };
  }

  return {
    tax: 0,
    allowanceTax: 0,
  };
}

export function calculateSalary(salaryRules: TaxRulesSalary) {
  const minSalaryYear = salaryRules.salaryMinimum * 12;
  const salarySocials =
    salaryRules.salaryMinimum * salaryRules.salaryContributionsRate * 12;
  const salaryTax =
    (salaryRules.salaryMinimum - salaryRules.salaryUntaxedPart) *
    salaryRules.salaryTax *
    12;

  return { minSalaryYear, salarySocials, salaryTax };
}

export function calculateSalaryBulgaria(
  reduction: number,
  minNetSalaryMonth: number
) {
  const minNetSalary = minNetSalaryMonth * 12;
  const employeeSocials = minNetSalary * 0.138;
  const companySocials = minNetSalary * 0.19;
  const taxableBase = minNetSalary - employeeSocials;
  const incomeTax = Math.max(0, (taxableBase - reduction) * 0.1);

  return {
    minSalaryYear: minNetSalary + companySocials,
    salaryTax: incomeTax,
    salarySocials: employeeSocials + companySocials,
  };
}
