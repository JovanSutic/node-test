import type { TaxRules } from "../../types/taxes.types";
import type {
  AdditionalTaxServiceContract,
  AdditionalTaxUnitContract,
  AllowanceServiceContract,
  AllowanceUnitContract,
  FinalValuesServiceContract,
  FinalValuesUnitContract,
  HealthServiceContract,
  HealthUnitContract,
  InitServiceContract,
  InitUnitContract,
  MunicipalTaxServiceContract,
  MunicipalTaxUnitContract,
  RegionalTaxServiceContract,
  RegionalTaxUnitContract,
  ReportItemsServiceContract,
  SalaryServiceContract,
  SalaryUnitContract,
  SocialServiceContract,
  SocialUnitContract,
  StateTaxServiceContract,
  StateTaxUnitContract,
  TaxableIncomeServiceContract,
  TaxableIncomeUnitContract,
  TaxCreditsServiceContract,
  TaxCreditsUnitContract,
  TaxDataStore,
  TaxProcessor,
  USData,
  USServiceContract,
  USUnitContract,
} from "../../types/taxProcessing.types";
import { calculateFederalIncomeTax } from "../saveFlow";
import { socialBrackets } from "../taxData";
import { calculateAllowance, distributeAllowance } from "./allowance";
import { executeCalcString, getTaxCredits } from "./credit";
import { getJoinTaxableIncome, getReductions } from "./socialsAndReduction";
import {
  calculateAnnualPersonalIncomeTax,
  calculateSalary,
  calculateSalaryBulgaria,
  getRegionalBrackets,
  getRegionalTax,
  getSoleRegionMatch,
  getStateBrackets,
  getStateTax,
} from "./tax";

export class TaxService {
  private store: TaxDataStore;

  constructor() {
    this.store = {
      grossIncome: 0,
      totalExpenses: 0,
      socials: 0,
      newSelfEmployedReduction: 0,
      assumedCostReduction: 0,
      taxableIncome: 0,
      totalAllowance: 0,
      stateTaxAllowance: 0,
      regionalTaxAllowance: 0,
      stateTax: 0,
      regionalTax: 0,
      municipalTax: 0,
      additionalTax: 0,
      taxCredit: 0,
      totalHealth: 0,
      minSalaryYear: 0,
      salarySocials: 0,
      salaryTax: 0,
      corporateTax: 0,
      withholdingTax: 0,

      // --- Final Metrics (Written by Finalizers) ---
      totalTax: 0,
      net: 0,
      netIncome: 0,
      effectiveTaxRate: 0,
      federalTax: { amount: 0, comment: "" },
      usSelfEmployedTaxNote: { amount: 0, comment: "" },
    };
  }

  private methods = {
    getSocials: () => this.store.socials,
    getTaxableIncome: () => this.store.taxableIncome,
    getGrossIncome: () => this.store.grossIncome,
    getTotalExpenses: () => this.store.totalExpenses,
    getNewSelfEmployedReduction: () => this.store.newSelfEmployedReduction,
    getStateTax: () => this.store.stateTax,
    getTotalTax: () => this.store.totalTax,
    getTotalAllowance: () => this.store.totalAllowance,
    getMinAnnualSalary: () => this.store.minSalaryYear,
    getSalarySocials: () => this.store.salarySocials,
    getSalaryDiff: () => {
      return (
        this.store.minSalaryYear -
        (this.store.salarySocials + this.store.salaryTax)
      );
    },
    getFinalValues: () => ({
      grossIncome: this.store.grossIncome,
      totalExpenses: this.store.totalExpenses,
      taxableIncome: this.store.taxableIncome,
      socials: this.store.socials,
      totalHealth: this.store.totalHealth,
      municipalTax: this.store.municipalTax,
      stateTax: this.store.stateTax,
      regionalTax: this.store.regionalTax,
      taxCredit: this.store.taxCredit,
      salaryTax: this.store.salaryTax,
      additionalTax: this.store.additionalTax,
      salaryContributions: this.store.salarySocials + this.store.salaryTax,
      salaryDiff:
        this.store.minSalaryYear -
        (this.store.salarySocials + this.store.salaryTax),
    }),
    getReportItemValues: () => ({
      grossIncome: this.store.grossIncome,
      totalExpenses: this.store.totalExpenses,
      socials: this.store.socials,
      totalHealth: this.store.totalHealth,
      totalAllowance: this.store.totalAllowance,
      assumedCostReduction: this.store.assumedCostReduction,
      taxableIncome: this.store.taxableIncome,
      municipalTax: this.store.municipalTax,
      stateTax: this.store.stateTax,
      regionalTax: this.store.regionalTax,
      totalTax: this.store.totalTax,
      effectiveRate: this.store.effectiveTaxRate,
      taxCredit: this.store.taxCredit,
      federalTax: this.store.federalTax,
      usSelfEmployedTaxNote: this.store.usSelfEmployedTaxNote,
      netIncome: this.store.netIncome,
      salarySocials: this.store.salarySocials,
      salaryTax: this.store.salaryTax,
      minSalaryYear: this.store.minSalaryYear,
      stateTaxAllowance: this.store.stateTaxAllowance,
      regionalTaxAllowance: this.store.regionalTaxAllowance,
      corporateTax: this.store.corporateTax,
      withholdingTax: this.store.withholdingTax,
      additionalTax: this.store.additionalTax,
    }),

    // Setters
    setTotalExpenses: (totalExpenses: number) => {
      this.store.totalExpenses = totalExpenses;
    },
    setGrossIncome: (grossIncome: number) => {
      this.store.grossIncome = grossIncome;
    },
    setSocials: (amount: number) => {
      this.store.socials = amount;
    },
    setTaxableIncome: (amount: number) => {
      this.store.taxableIncome = amount;
    },
    setTotalTax: (amount: number) => {
      this.store.totalTax = amount;
    },
    setNetIncome: (amount: number) => {
      this.store.netIncome = amount;
    },
    setNewSelfEmployedReduction: (amount: number) => {
      this.store.newSelfEmployedReduction = amount;
    },
    setAssumedCostReduction: (amount: number) => {
      this.store.assumedCostReduction = amount;
    },
    setTotalAllowance: (amount: number) => {
      this.store.totalAllowance = amount;
    },
    setRegionalTax: (amount: number) => {
      this.store.regionalTax = amount;
    },
    setRegionalTaxAllowance: (amount: number) => {
      this.store.regionalTaxAllowance = amount;
    },
    setStateTax: (amount: number) => {
      this.store.stateTax = amount;
    },
    setStateTaxAllowance: (amount: number) => {
      this.store.stateTaxAllowance = amount;
    },
    setMunicipalTax: (amount: number) => {
      this.store.municipalTax = amount;
    },
    setCorporateTax: (amount: number) => {
      this.store.corporateTax = amount;
    },
    setWithholdingTax: (amount: number) => {
      this.store.withholdingTax = amount;
    },
    setAdditionalTax: (amount: number) => {
      this.store.additionalTax = amount;
    },
    setHealth: (amount: number) => {
      this.store.totalHealth = amount;
    },
    setTaxCredits: (amount: number) => {
      this.store.taxCredit = amount;
    },
    setNet: (amount: number) => {
      this.store.net = amount;
    },
    setEffectiveTaxRate: (amount: number) => {
      this.store.effectiveTaxRate = amount;
    },
    setUSData: (
      federal: USData | undefined,
      selfEmployed: USData | undefined
    ) => {
      this.store.federalTax = federal;
      this.store.usSelfEmployedTaxNote = selfEmployed;
    },
    setSalaryData: (
      minSalaryYear: number,
      salarySocials: number,
      salaryTax: number
    ) => {
      this.store.minSalaryYear = minSalaryYear;
      this.store.salarySocials = salarySocials;
      this.store.salaryTax = salaryTax;
    },
  };

  // Helper to pick methods - properly typed
  private createService<T>(methodNames: (keyof typeof this.methods)[]): T {
    const service = {} as T;
    for (const name of methodNames) {
      (service as any)[name] = this.methods[name];
    }
    return service;
  }

  forInit(): InitServiceContract {
    return this.createService<InitServiceContract>([
      "setTotalExpenses",
      "setGrossIncome",
    ]);
  }

  forTaxableIncome(): TaxableIncomeServiceContract {
    return this.createService<TaxableIncomeServiceContract>([
      "getGrossIncome",
      "getMinAnnualSalary",
      "getTotalExpenses",
      "getSocials",
      "setTaxableIncome",
      "setNewSelfEmployedReduction",
      "setAssumedCostReduction",
    ]);
  }

  forSocials(): SocialServiceContract {
    return this.createService<SocialServiceContract>([
      "getGrossIncome",
      "getTotalExpenses",
      "getSalarySocials",
      "setSocials",
    ]);
  }

  forAllowance(): AllowanceServiceContract {
    return this.createService<AllowanceServiceContract>(["setTotalAllowance"]);
  }

  forRegionalTax(): RegionalTaxServiceContract {
    return this.createService<RegionalTaxServiceContract>([
      "getTaxableIncome",
      "getTotalAllowance",
      "setRegionalTax",
      "setRegionalTaxAllowance",
    ]);
  }

  forStateTax(): StateTaxServiceContract {
    return this.createService<StateTaxServiceContract>([
      "getTaxableIncome",
      "getTotalAllowance",
      "setStateTax",
      "setStateTaxAllowance",
      "setCorporateTax",
      "setWithholdingTax",
    ]);
  }

  forMunicipalTax(): MunicipalTaxServiceContract {
    return this.createService<MunicipalTaxServiceContract>([
      "getTaxableIncome",
      "setMunicipalTax",
    ]);
  }

  forAdditionalTax(): AdditionalTaxServiceContract {
    return this.createService<AdditionalTaxServiceContract>([
      "setAdditionalTax",
      "getTaxableIncome",
      "getStateTax",
      "getSalaryDiff",
    ]);
  }

  forTotalHealth(): HealthServiceContract {
    return this.createService<HealthServiceContract>([
      "getGrossIncome",
      "getTotalExpenses",
      "setHealth",
    ]);
  }

  forTaxCredit(): TaxCreditsServiceContract {
    return this.createService<TaxCreditsServiceContract>([
      "getTaxableIncome",
      "setTaxCredits",
    ]);
  }

  forSalary(): SalaryServiceContract {
    return this.createService<SalaryServiceContract>(["setSalaryData"]);
  }

  forFinalValues(): FinalValuesServiceContract {
    return this.createService<FinalValuesServiceContract>([
      "getFinalValues",
      "setNet",
      "setNetIncome",
      "setTotalTax",
      "setEffectiveTaxRate",
    ]);
  }

  forUSData(): USServiceContract {
    return this.createService<USServiceContract>([
      "getGrossIncome",
      "getTotalTax",
      "getSocials",
      "setUSData",
    ]);
  }

  forReportItems(): ReportItemsServiceContract {
    return this.createService<ReportItemsServiceContract>([
      "getReportItemValues",
    ]);
  }
}

export const setInitialData: TaxProcessor<
  InitServiceContract,
  InitUnitContract
> = (service, unit) => {
  service.setGrossIncome(unit.grossIncome);
  service.setTotalExpenses(unit.totalExpenses);
};

function calculateSocialBase(
  grossIncome: number,
  expenses: number,
  age: number,
  rules: TaxRules,
  year: number,
  kids = 0
) {
  if (rules.social.baseType === "incomeMinusAllExpenses") {
    return ((grossIncome - expenses) * rules.social.rateIndex) / 12;
  }
  if (rules.social.baseType === "income") {
    return grossIncome * rules.social.rateIndex;
  }

  if (rules.social.baseType === "taxIncome") {
    const { taxableIncome } = getReductions(
      {
        gross: grossIncome,
        expenses: expenses,
        socials: 0,
        kids,
      },
      { age },
      year,
      rules
    );

    return taxableIncome;
  }

  if (rules.social.baseType === "taxIncomeAndRate") {
    const { taxableIncome } = getReductions(
      {
        gross: grossIncome,
        expenses: expenses,
        socials: 0,
        kids,
      },
      { age },
      year,
      rules
    );

    const base = taxableIncome * rules.social.rateIndex;

    return rules.social.maxCapBase
      ? Math.min(base, rules.social.maxCapBase)
      : base;
  }

  if (rules.social.baseType === "flat" && rules.social.baseAmount) {
    if (rules.social.baseFrequency === "monthly") {
      return rules.social.baseAmount * 12;
    }

    return rules.social.baseAmount;
  }

  if (
    rules.social.baseType === "incomeBetweenMaxMin" &&
    rules.social.minCapBase &&
    rules.social.maxCapBase
  ) {
    const base = Math.min(
      Math.max(grossIncome, rules.social.minCapBase),
      rules.social.maxCapBase
    );
    return base;
  }

  return 0;
}

export const setSocials: TaxProcessor<
  SocialServiceContract,
  SocialUnitContract
> = (service, unit) => {
  const grossIncome = service.getGrossIncome();
  const expenses = service.getTotalExpenses();
  const { rules, year, dependents, age } = unit;

  if (rules.social.allowDiscount && year < rules.social.discountLength) {
    service.setSocials(rules.social.discountedAmount);
  } else {
    const base = calculateSocialBase(
      grossIncome,
      expenses,
      age,
      rules,
      year,
      dependents?.filter((item) => item.type === "kid").length || 0
    );
    if (base == null || isNaN(base) || base < 0) {
      throw new Error("Failed to calculate social base");
    }
    if (rules.social.type === "progressive") {
      const bracket = socialBrackets.find((item) => {
        if (base > item.from && base < item.to) {
          return item;
        }
      });

      service.setSocials((bracket?.fee || 1) * 12);
    } else if (rules.social.type === "salary") {
      const result = service.getSalarySocials();
      service.setSocials(result);
    } else {
      const social = base * rules.social.rate;
      if (rules.social.minCap && rules.social.maxCap === 0) {
        service.setSocials(Math.max(rules.social.minCap, social));
      } else {
        service.setSocials(Math.min(rules.social.maxCap, social));
      }
    }
  }
};

export const setTaxableIncome: TaxProcessor<
  TaxableIncomeServiceContract,
  TaxableIncomeUnitContract
> = (service, unit) => {
  const { age, rules, reportUserData, config, kids, isForJoint, year } = unit;

  const incomeData = {
    gross: service.getGrossIncome(),
    expenses: service.getTotalExpenses(),
    socials: service.getSocials(),
    kids,
    minSalary: service.getMinAnnualSalary(),
  };

  const result = isForJoint
    ? getJoinTaxableIncome(reportUserData, config, year)
    : getReductions(incomeData, { age }, year, rules);

  if (
    result.taxableIncome == null ||
    isNaN(result.taxableIncome) ||
    result.taxableIncome < 0
  ) {
    throw new Error("Failed to calculate taxable income");
  }

  service.setTaxableIncome(result.taxableIncome);
  service.setNewSelfEmployedReduction(result.newSelfEmployedReduction);
  service.setAssumedCostReduction(result.assumedCostReduction);
};

export const setTotalAllowance: TaxProcessor<
  AllowanceServiceContract,
  AllowanceUnitContract
> = (service, unit) => {
  const { reportUserData, year, rules, index } = unit;
  const additionalAllowance = calculateAllowance(
    reportUserData.dependents,
    year,
    rules
  );

  const allowances = distributeAllowance(
    reportUserData.incomes,
    additionalAllowance
  );

  const totalAllowance =
    rules.allowance.personal +
    (rules.allowance.allow
      ? allowances
          .filter((item) => item.incomeIndex === index)
          .reduce((prev, next) => prev + next.amount, 0)
      : 0);

  if (isNaN(totalAllowance) || totalAllowance < 0) {
    throw new Error("Failed to calculate total allowance");
  }

  service.setTotalAllowance(totalAllowance);
};

export const setRegionalTax: TaxProcessor<
  RegionalTaxServiceContract,
  RegionalTaxUnitContract
> = (service, unit) => {
  const { rules, country, cityId } = unit;
  const regionalBrackets = rules.tax.level.split(",").includes("regional")
    ? getRegionalBrackets(country, cityId)
    : [];

  const { tax, allowanceTax } = getRegionalTax(
    service.getTaxableIncome(),
    service.getTotalAllowance(),
    regionalBrackets
  );

  if (isNaN(tax) || tax < 0 || isNaN(allowanceTax) || allowanceTax < 0) {
    throw new Error("Failed to calculate regional tax");
  }

  service.setRegionalTaxAllowance(allowanceTax);
  service.setRegionalTax(tax);
};

export const setStateTax: TaxProcessor<
  StateTaxServiceContract,
  StateTaxUnitContract
> = (service, unit) => {
  const { rules, country, cityId } = unit;
  const stateBrackets = getStateBrackets(country, cityId);
  const isExclusiveRegion = rules.tax.regionalExclusivity
    ? getSoleRegionMatch(country, cityId)
    : false;

  const { tax, allowanceTax, breakdown } = getStateTax({
    taxableIncome: service.getTaxableIncome(),
    totalAllowance: service.getTotalAllowance(),
    isStateTax: !isExclusiveRegion,
    brackets: stateBrackets,
    taxRules: rules.tax,
  });

  if (isNaN(tax) || tax < 0 || isNaN(allowanceTax) || allowanceTax < 0) {
    throw new Error("Failed to calculate state tax");
  }

  if (breakdown) {
    service.setCorporateTax(breakdown.corporateTax);
    service.setWithholdingTax(breakdown.withholdingTax);
  }

  service.setStateTaxAllowance(allowanceTax);
  service.setStateTax(tax);
};

export const setMunicipalTax: TaxProcessor<
  MunicipalTaxServiceContract,
  MunicipalTaxUnitContract
> = (service, unit) => {
  if (unit.rules.tax.other?.municipal) {
    const municipalTax =
      service.getTaxableIncome() * unit.rules.tax.other.municipal;

    if (isNaN(municipalTax) || municipalTax < 0) {
      throw new Error("Failed to calculate municipal tax");
    }

    service.setMunicipalTax(municipalTax);
  }
};

export const setAdditionalTax: TaxProcessor<
  AdditionalTaxServiceContract,
  AdditionalTaxUnitContract
> = (service, unit) => {
  const { rules, age, dependents } = unit;
  if (rules.salary && rules.tax.other?.allowAdditional) {
    const firstNet =
      service.getTaxableIncome() -
      service.getStateTax() +
      service.getSalaryDiff();
    const tax = calculateAnnualPersonalIncomeTax(
      rules.salary?.salaryAverageAnnual,
      firstNet,
      dependents,
      age
    );

    if (isNaN(tax) || tax < 0) {
      throw new Error("Failed to calculate additional personal tax");
    }

    service.setAdditionalTax(tax);
  }
};

function calculateHealthBase(
  grossIncome: number,
  expenses: number,
  age: number,
  rules: TaxRules
) {
  if (rules.social.baseType === "taxIncomeAndRate" && rules.health) {
    const { taxableIncome } = getReductions(
      {
        gross: grossIncome,
        expenses,
        socials: 0,
        kids: 0,
      },
      { age },
      0,
      rules
    );

    const base = taxableIncome * rules.health.rateIndex;

    return rules.health.maxCapBase
      ? Math.min(base, rules.health.maxCapBase)
      : base;
  }

  return 0;
}

export const setTotalHealth: TaxProcessor<
  HealthServiceContract,
  HealthUnitContract
> = (service, unit) => {
  const { rules, age } = unit;
  let healthResult = 0;

  if (rules.health) {
    const base = calculateHealthBase(
      service.getGrossIncome(),
      service.getTotalExpenses(),
      age,
      rules
    );
    const health = base * rules.health.rate;
    if (rules.health.minCap && rules.health.maxCap === 0) {
      healthResult = Math.max(rules.health.minCap, health);
    } else {
      healthResult = Math.min(rules.health.maxCap, health);
    }
  }

  if (isNaN(healthResult) || healthResult < 0) {
    throw new Error("Failed to calculate total health contributions");
  }

  if (healthResult > 0) {
    service.setHealth(healthResult);
  }
};

export const setTaxCredits: TaxProcessor<
  TaxCreditsServiceContract,
  TaxCreditsUnitContract
> = (service, unit) => {
  const { rules, year, isForJoint, incomesLength, reportUserData } = unit;
  const taxCredit =
    getTaxCredits(
      rules,
      reportUserData,
      year,
      service.getTaxableIncome(),
      isForJoint
    ) / incomesLength;

  if (isNaN(taxCredit) || taxCredit < 0) {
    throw new Error("Failed to calculate total health contributions");
  }

  service.setTaxCredits(taxCredit);
};

export const setSalary: TaxProcessor<
  SalaryServiceContract,
  SalaryUnitContract
> = (service, unit) => {
  const { rules, country } = unit;
  if (!rules.salary) {
    return;
  }

  const { minSalaryYear, salarySocials, salaryTax } =
    country === "Bulgaria"
      ? calculateSalaryBulgaria(0, rules.salary.salaryMinimum)
      : calculateSalary(rules.salary);

  if (
    isNaN(minSalaryYear) ||
    minSalaryYear < 0 ||
    isNaN(salarySocials) ||
    salarySocials < 0 ||
    isNaN(salaryTax) ||
    salaryTax < 0
  ) {
    throw new Error("Failed to calculate salary info");
  }

  service.setSalaryData(minSalaryYear, salarySocials, salaryTax);
};

export const setFinalValues: TaxProcessor<
  FinalValuesServiceContract,
  FinalValuesUnitContract
> = (service, unit) => {
  const { rules } = unit;

  const finalValues = service.getFinalValues();
  const results = {
    totalTax: 0,
    net: 0,
    netIncome: 0,
  };

  for (const [key, value] of Object.entries(rules.finals)) {
    const result = executeCalcString(value, finalValues);

    if (key === "totalTax") {
      results.totalTax = Math.max(0, result);
      service.setTotalTax(result);
    }

    if (key === "net") {
      results.net = result;
      service.setNet(result);
    }

    if (key === "netIncome") {
      results.netIncome = result;
      service.setNetIncome(result);
    }
  }

  if (results.totalTax === 0) {
    results.netIncome = results.net;
  }

  if (
    isNaN(results.totalTax) ||
    results.totalTax < 0 ||
    isNaN(results.netIncome) ||
    results.netIncome < 1 ||
    isNaN(results.net) ||
    results.net < 1
  ) {
    throw new Error("Failed to calculate final values");
  }

  const effectiveRate =
    (finalValues.municipalTax +
      finalValues.regionalTax +
      finalValues.stateTax +
      finalValues.salaryContributions +
      finalValues.socials -
      finalValues.taxCredit) /
    finalValues.grossIncome;

  if (isNaN(effectiveRate) || effectiveRate < 0) {
    throw new Error("Failed to calculate effective tax rate");
  }

  service.setEffectiveTaxRate(effectiveRate);
};

export const setUsData: TaxProcessor<USServiceContract, USUnitContract> = (
  service,
  unit
) => {
  const { isUSCitizen, eurRate } = unit;
  const federalTax = calculateFederalIncomeTax({
    income: service.getGrossIncome(),
    taxPaidAbroad: service.getTotalTax(),
    eurRate,
  });

  service.setUSData(
    isUSCitizen
      ? {
          amount: federalTax.amount,
          comment: federalTax.comment,
        }
      : undefined,
    isUSCitizen && service.getSocials() > 0
      ? {
          amount: 0,
          comment:
            "You don’t need to pay U.S. self-employment tax if you’re already paying social security contributions in country of tax residence, thanks to the valid Totalization Agreement.",
        }
      : undefined
  );
};
