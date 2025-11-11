import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeApiService } from '../coin-exchange-rate/coin-exchange-api.service';
import { CoinExchangeRateService } from '../coin-exchange-rate/coin-exchange-rate.service';
import { CreateCoinDto } from './dto/create-coin.dto';
import Redis from 'ioredis';

@Injectable()
export class CoinService {
  private readonly logger = new Logger(CoinService.name);
  private readonly cacheTTL =
    Number(process.env.EXCHANGE_RATE_PULL_INTERVAL_SECONDS) || 10;

  public static EVENTS = {
    COIN_UPDATE: 'coinUpdate',
  };

  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly coinExchangeApiService: CoinExchangeApiService,
    @Inject(forwardRef(() => CoinExchangeRateService))
    private readonly coinExchangeRateService: CoinExchangeRateService,
    private readonly coinGateway: CoinGateway,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async findAll(filters: { name?: string } = {}): Promise<Coin[]> {
    const cacheKey = `coins:${filters.name || 'all'}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Coin[];
    }

    const query = this.coinRepository
      .createQueryBuilder('coin')
      .leftJoinAndSelect('coin.exchangeRates', 'exchangeRate');

    if (filters.name) {
      query.andWhere('coin.name LIKE :name', { name: `%${filters.name}%` });
    }

    query.orderBy('coin.createdAt', 'DESC');

    const coins = await query.getMany();
    const sortedCoins = coins.map((coin) => ({
      ...coin,
      exchangeRates: coin.exchangeRates.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    }));

    await this.redisClient.set(
      cacheKey,
      JSON.stringify(sortedCoins),
      'EX',
      this.cacheTTL,
    );

    return sortedCoins;
  }

  async deleteCoin(id: number): Promise<void> {
    const coin = await this.coinRepository.findOne({ where: { id } });

    if (!coin) {
      throw new Error(`Coin with id ${id} does not exist`);
    }
  
    await this.coinRepository.delete(id);
    await this.clearCache();
  }

  async create(createCoinDto: CreateCoinDto): Promise<void> {
    const targetCoin = await this.coinExchangeApiService.getCoin(
      createCoinDto.name,
    );
    const coin = this.coinRepository.create({
      name: targetCoin.name,
      symbol: targetCoin.symbol,
      apiId: targetCoin.id,
    });
    await this.coinRepository.save(coin);
    await this.clearCache();
    await this.coinExchangeRateService.updateCoinsRate({ name: coin.name });
  }

  async sendUpdate(data: { action: string; coins?: Coin[] }): Promise<void> {
    if (data.action === 'rate_update') {
      const coins = await this.findAll();
      data.coins = coins;
    }
    this.coinGateway.server.emit(CoinService.EVENTS.COIN_UPDATE, data);
  }

  async clearCache(filters: { name?: string } = {}) {
    const cacheKey = `coins:${filters.name || 'all'}`;
    await this.redisClient.del(cacheKey);
  }
}
