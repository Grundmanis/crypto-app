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
    private readonly coinExchangeRateService: CoinExchangeRateService,
  ) {
    // this.intervalSeconds = Number(this.configService.get('EXCHANGE_RATE_PULL_INTERVAL')) || 10;
  }

  // TODO: limit error from api
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.logger.debug(`${CoinExchangeCronService.name} cron started`);
    this.coinExchangeRateService.updateCoinsRate();
  }
}
