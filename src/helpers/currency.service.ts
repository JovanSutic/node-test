import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { getCurrencyRate } from "../utils/numbers";
import type { currencyString, ExchangeRate } from "../types/flow.types";

@Injectable()
export class CurrenciesService {
  constructor(private readonly httpService: HttpService) {}

  async fetchCurrencies(): Promise<any> {
    const apiUrl =
      "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json"; // or your source
    try {
      const response = await firstValueFrom(this.httpService.get(apiUrl));
      return response.data; // adjust based on the actual response structure
    } catch (error) {
      throw new Error("Failed to fetch currencies");
    }
  }

  async fetchRate(): Promise<ExchangeRate> {
    try {
      const currencies = await this.fetchCurrencies();
      if (!currencies?.eur) {
        throw new InternalServerErrorException("Currencies are empty");
      }

      return {
        eur: 1,
        usd: getCurrencyRate(currencies.eur, "usd", "eur"),
        gbp: getCurrencyRate(currencies.eur, "gbp", "eur"),
      };
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch currencies");
    }
  }
}
