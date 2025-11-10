import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CoinService } from 'src/coin/coin.service';
import { Coin } from 'src/coin/coin.entity';

// TODO: create a new schedularService?
@Injectable()
export class CoinExchangeRateService {
  // private intervalSeconds: number;

  private readonly logger = new Logger(CoinExchangeRateService.name);

  constructor(
    @InjectRepository(CoinExchangeRate)
    private readonly coinExchangeRateRepository: Repository<CoinExchangeRate>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly coinService: CoinService,
  ) {
    // this.intervalSeconds = Number(this.configService.get('EXCHANGE_RATE_PULL_INTERVAL')) || 10;
  }

  async findAll(): Promise<CoinExchangeRate[]> {
    return this.coinExchangeRateRepository.find();
  }

  // TODO: limit error from api
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug(`Called when the current second is`);
    const coins = await this.coinService.findAll();
    // TODO: refactor
    coins.forEach((coin) => {
      this.getCoinCurrenyPrice(coin);
    });
  }

  // TODO: move out
  async getCoinData(coinId) {
    
  }

  async getCoinCurrenyPrice(coin: Coin) {
    const observable$ = this.httpService.get(
      // TODO: change
      `${this.configService.get('API_URL')}/coins/${coin.apiId}`,
    );

    // const observable$ = this.httpService.get(
    //   `${this.configService.get('API_URL')}/coins/${coinId}?${this.configService.getOrThrow('API_AUTH_KEY')}=${this.configService.getOrThrow('API_KEY')}`,
    // );

    // Convert Observable to Promise
    const response = await firstValueFrom(observable$);

    // AxiosResponse has { data, status, headers, config }
    console.log(Object.keys(response.data)); // THIS should show your actual API keys
    const coinData = response.data;
    // TODO: validate coin data exists
    // TODO: add types

    // save in db
    await this.createRecord({
      coinId: coin.id,
      currentPrice: coinData.market_data.current_price,
    });
  }

  async createRecord(data: unknown) {
    // TODO: add logger
    const exchangeRate = new CoinExchangeRate();
    // @ts-ignore
    exchangeRate.coin = data.coinId;
    // @ts-ignore
    exchangeRate.currentPrice = data.currentPrice;
    await this.coinExchangeRateRepository.save(exchangeRate);
    console.log('rec saved');
  }
}
