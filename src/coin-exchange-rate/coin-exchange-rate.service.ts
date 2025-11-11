import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { Repository } from 'typeorm';
import { CoinService } from '../coin/coin.service';
import { CoinExchangeApiService } from './coin-exchange-api.service';
import { Coin } from '../coin/coin.entity';
import { CoinExchangeCronService } from './coin-exchange-cron.service';
import { ConfigService } from '@nestjs/config';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class CoinExchangeRateService {
  private readonly logger = new Logger(CoinExchangeRateService.name);
  private readonly historyLimit: number = 10;

  constructor(
    @Inject(forwardRef(() => CoinExchangeCronService))
    private readonly coinExchangeCronService: CoinExchangeCronService,
    @InjectRepository(CoinExchangeRate)
    private readonly coinExchangeRateRepository: Repository<CoinExchangeRate>,
    @Inject(forwardRef(() => CoinService))
    private readonly coinService: CoinService,
    private readonly coinExchangeApiService: CoinExchangeApiService,
    private readonly configService: ConfigService,
  ) {
    this.coinExchangeCronService.startJob(
      Number(this.configService.get('EXCHANGE_RATE_PULL_INTERVAL_SECONDS')) ||
        10,
    );
  }

  async findAll(): Promise<CoinExchangeRate[]> {
    return this.coinExchangeRateRepository.find();
  }

  async createRecord(data: CreateExchangeRateDto): Promise<void> {
    const exchangeRate = new CoinExchangeRate();
    exchangeRate.coin = { id: data.coinId } as Coin;
    exchangeRate.currentPrice = data.currentPrice;
    await this.coinExchangeRateRepository.save(exchangeRate);
  }

  async updateCoinsRate(filters: { name?: string } = {}) {
    const coins = await this.coinService.findAll(filters);

    const targetCoins = coins.map((coin) => coin.apiId).join(',');
    this.logger.debug(`Target coins ${targetCoins}`);
    const data =
      await this.coinExchangeApiService.getCoinsCurrentPrice(targetCoins);

    for (const coin of coins) {
      if (!data[coin.apiId]) {
        continue;
      }
      await this.createRecord({
        coinId: coin.id,
        currentPrice: data[coin.apiId],
      });
      await this.trimHistory(coin.id);
    }

    if (coins.length) {
      await this.coinService.sendUpdate({ action: 'rate_update' });
    }
  }

  private async trimHistory(coinId: number): Promise<void> {
    this.logger.debug(`Trim history for coin ${coinId}`);
    const rates = await this.coinExchangeRateRepository
      .createQueryBuilder('rate')
      .select(['rate.id', 'rate.createdAt'])
      .where('rate.coinId = :coinId', { coinId })
      .orderBy('rate.createdAt', 'DESC')
      .getMany();

    const oldRecordIds = rates.slice(this.historyLimit).map((r) => r.id);

    this.logger.debug('oldRecords length', oldRecordIds.length);

    if (oldRecordIds.length > 0) {
      await this.coinExchangeRateRepository.delete(oldRecordIds);
    }
  }
}
