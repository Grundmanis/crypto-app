import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';

@Injectable()
export class CoinExchangeApiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCoin(coinId: string): Promise<{name: string, symbol: string, id: string}> {
    return this.makeRequest(`/coins/${coinId.toLowerCase()}`);
  }

  // TODO: return type
  async getCoinsCurrentPrice(
    targetCoins: string,
    targetCurrencies: string = 'eur',
  ) {
    return this.makeRequest(`/simple/price/`, {
      ids: targetCoins,
      vs_currencies: targetCurrencies,
    });
  }

  // TODO: return type
  private async makeRequest(url: string, query: Record<string, any> = {}) {
    try {
      const apiUrl = this.configService.get('API_URL');
      const apiKey = this.configService.getOrThrow('API_AUTH_KEY');
      const apiValue = this.configService.getOrThrow('API_KEY');

      const fullQuery = {
        [apiKey]: apiValue,
        ...query,
      };

      const queryString = qs.stringify(fullQuery);
      const targetUrl = `${apiUrl}${url}?${queryString}`;

      const observable$ = this.httpService.get(targetUrl);
      const response = await firstValueFrom(observable$);

      return response.data;
    } catch (e) {
      throw new HttpException(e.response.data.error, HttpStatus.BAD_REQUEST);
    }
  }
}
