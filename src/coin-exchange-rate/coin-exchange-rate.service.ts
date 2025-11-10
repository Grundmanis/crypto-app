import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { Repository } from 'typeorm';
import { CoinService } from 'src/coin/coin.service';
import { CoinExchangeApiService } from './coin-exchange-api.service';

@Injectable()
export class CoinExchangeRateService {

  private readonly logger = new Logger(CoinExchangeRateService.name);

  constructor(
    @InjectRepository(CoinExchangeRate)
    private readonly coinExchangeRateRepository: Repository<CoinExchangeRate>,
    @Inject(forwardRef(() => CoinService))
    private readonly coinService: CoinService,
    private readonly coinExchangeApiService: CoinExchangeApiService,
  ) {
  }

  async findAll(): Promise<CoinExchangeRate[]> {
    return this.coinExchangeRateRepository.find();
  }

  async createRecord(data: unknown) {
    const exchangeRate = new CoinExchangeRate();
    // @ts-ignore
    exchangeRate.coin = data.coinId;
    // @ts-ignore
    exchangeRate.currentPrice = data.currentPrice;
    await this.coinExchangeRateRepository.save(exchangeRate);
  }

  // TODO: any
  async updateCoinsRate(filters: { name?: string } = {}) {
    const coins = await this.coinService.findAll(filters);
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
      await this.createRecord({
        coinId: coin.id,
        currentPrice: data[coin.apiId],
      });
      this.logger.debug(`Saved in db`)
    }

    this.coinService.sendUpdate({ action: 'rateUpdate' });
  }
}
