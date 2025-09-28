import type { TaxBracket } from "../../types/flow.types";
import type { TaxType } from "../../types/taxes.types";
import { getProgressiveTax } from "../saveFlow";
import { getPortugalBrackets, regionalTaxBrackets, regionalTaxBracketsItaly, regionsItaly, regionsSpain, spanishTaxBrackets, stateTaxBracketsItaly } from "../taxData";

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
  type?: TaxType;
  rate?: number;
}) {
  const { isStateTax, type, taxableIncome, brackets, totalAllowance, rate } =
    taxData;

  if (isStateTax) {
    if (type === "progressive") {
      const stateTax = getProgressiveTax(taxableIncome, brackets);
      const stateAllowanceTax = getProgressiveTax(totalAllowance, brackets);

      return {
        tax: stateTax.totalTax - stateAllowanceTax.totalTax,
        allowanceTax: stateAllowanceTax.totalTax,
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