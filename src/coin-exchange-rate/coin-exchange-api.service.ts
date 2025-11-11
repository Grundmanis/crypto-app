import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';
import { CoinCurrentPrice } from './types/coin-current-price.type';
import { CoinData } from './types/coin-data.type';

@Injectable()
export class CoinExchangeApiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCoin(coinId: string): Promise<CoinData> {
    return this.makeRequest(`/coins/${coinId.toLowerCase()}`);
  }

  async getCoinsCurrentPrice(
    targetCoins: string,
    targetCurrencies: string = 'eur',
  ): Promise<CoinCurrentPrice> {
    return this.makeRequest(`/simple/price/`, {
      ids: targetCoins,
      vs_currencies: targetCurrencies,
    });
  }

  private async makeRequest<T = any>(
    url: string,
    query: Record<string, any> = {},
  ): Promise<T> {
    try {
      const apiUrl = this.configService.getOrThrow<string>('API_URL');
      const apiKey = this.configService.getOrThrow<string>('API_AUTH_KEY');
      const apiValue = this.configService.getOrThrow<string>('API_KEY');

      const fullQuery = {
        [apiKey]: apiValue,
        ...query,
      };

      const queryString = qs.stringify(fullQuery);
      const targetUrl = `${apiUrl}${url}?${queryString}`;

      const observable$ = this.httpService.get<T>(targetUrl);
      const response = await firstValueFrom(observable$);

      return response.data;
    } catch (e: any) {
      const error = e as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const message =
        error.response?.data?.error ?? error.message ?? 'Unknown error';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
