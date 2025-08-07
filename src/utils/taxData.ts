import type { TaxBracket } from "../types/flow.types";

export const spanishTaxBrackets: TaxBracket[] = [
  { from: 0, to: 12450, rate: 19 },
  { from: 12451, to: 20200, rate: 24 },
  { from: 20201, to: 35200, rate: 30 },
  { from: 35201, to: 60000, rate: 37 },
  { from: 60001, to: 300000, rate: 45 },
  { from: 300001, to: Number.POSITIVE_INFINITY, rate: 47 },
];
