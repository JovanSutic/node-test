import type { currencyString } from "../types/flow.types";

export function isNumber(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getCurrencyRate(
  currencyMap: Record<string, number>,
  from: currencyString,
  to: currencyString
) {
  if (from === "eur") {
    return currencyMap[to];
  } else {
    return 1 / currencyMap[from];
  }
}
