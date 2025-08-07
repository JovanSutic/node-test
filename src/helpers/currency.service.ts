import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CurrenciesService {
  constructor(private readonly httpService: HttpService) {}

  async fetchCurrencies(): Promise<any> {
    const apiUrl = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json"; // or your source
    try {
      const response = await firstValueFrom(this.httpService.get(apiUrl));
      return response.data; // adjust based on the actual response structure
    } catch (error) {
      throw new Error("Failed to fetch currencies");
    }
  }
}
