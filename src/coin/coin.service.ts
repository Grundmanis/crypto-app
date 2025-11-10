import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { CreateCoinDto } from './coin.controller';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeApiService } from 'src/coin-exchange-rate/coin-exchange-api.service';
import { CoinExchangeRateService } from 'src/coin-exchange-rate/coin-exchange-rate.service';

@Injectable()
export class CoinService {
  private readonly logger = new Logger(CoinService.name);

  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly coinExchangeApiService: CoinExchangeApiService,
    @Inject(forwardRef(() => CoinExchangeRateService))
    private readonly coinExchangeRateService: CoinExchangeRateService,
    private readonly coinGateway: CoinGateway,
  ) {}

  async findAll(filters: { name?: string } = {}): Promise<Coin[]> {
    const query = this.coinRepository
      .createQueryBuilder('coin')
      .leftJoinAndSelect('coin.exchangeRates', 'exchangeRate');
  
    if (filters.name) {
      query.andWhere('coin.name LIKE :name', { name: `%${filters.name}%` });
    }
  
    query.orderBy('coin.createdAt', 'DESC');
  
    const coins = await query.getMany();
    const sortedCoins = coins.map(coin => ({
      ...coin,
      exchangeRates: coin.exchangeRates.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    }));
  
    return sortedCoins;
  }

  async deleteCoin(id: number): Promise<void> {
    void this.coinRepository.delete(id);
  }

  async create(createCoinDto: CreateCoinDto): Promise<void>{
      const targetCoin = await this.coinExchangeApiService.getCoin(createCoinDto.name)
      const coin = this.coinRepository.create({
        name: targetCoin.name,
        symbol: targetCoin.symbol,
        apiId: targetCoin.id,
      });
      await this.coinRepository.save(coin);

    this.coinExchangeRateService.updateCoinsRate({name: coin.name});
    }

  async sendUpdate(data: any): Promise<void> {
    // todo: const for action
    if (data.action === 'rateUpdate') {
      const coins = await this.findAll();
      data.coins = coins;
    }
    this.coinGateway.server.emit('coinUpdate', data);
  }
}
