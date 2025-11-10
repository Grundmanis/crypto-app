import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinService } from 'src/coin/coin.service';
import { CoinExchangeApiService } from './coin-exchange-api.service';
import { CoinExchangeRateService } from './coin-exchange-rate.service';

@Injectable()
export class CoinExchangeCronService {
  // private intervalSeconds: number;

  private readonly logger = new Logger(CoinExchangeCronService.name);

  constructor(
    private readonly coinService: CoinService,
    private readonly coinExchangeApiService: CoinExchangeApiService,
    private readonly coinExchangeRateService: CoinExchangeRateService,
  ) {
    // this.intervalSeconds = Number(this.configService.get('EXCHANGE_RATE_PULL_INTERVAL')) || 10;
  }

  // TODO: limit error from api
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug(`${CoinExchangeCronService.name} cron started`);
    const coins = await this.coinService.findAll();
    const targetCoins = coins.map((coin) => coin.apiId).join(',');
    this.logger.debug(`Target coins ${targetCoins}`)
    const data = await this.coinExchangeApiService.getCoinsCurrentPrice(targetCoins);
    this.logger.debug(`Target coin current prices ${data}`)

    for (const coin of coins) {
      this.logger.debug(`Updating ${coin.apiId}`)
      if (!data[coin.apiId]) {
        this.logger.debug(`No coin info, skipping`)
        continue;
      }
      await this.coinExchangeRateService.createRecord({
        coinId: coin.id,
        currentPrice: data[coin.apiId],
      });
      this.logger.debug(`Saved in db`)
    }

    this.coinService.sendUpdate({ action: 'rateUpdate' });
  }
}
