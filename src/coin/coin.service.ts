import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { CreateCoinDto } from './coin.controller';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeApiService } from 'src/coin-exchange-rate/coin-exchange-api.service';

@Injectable()
export class CoinService {
  private readonly logger = new Logger(CoinService.name);

  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly coinExchangeApoService: CoinExchangeApiService,
    private readonly coinGateway: CoinGateway,
  ) {}

  async findAll(): Promise<Coin[]> {
    const coins = await this.coinRepository
      .createQueryBuilder('coin')
      .leftJoinAndSelect('coin.exchangeRates', 'exchangeRate')
      .orderBy('coin.createdAt', 'DESC')
      .getMany();

    return coins.map((coin) => ({
      ...coin,
      exchangeRates: coin.exchangeRates.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    }));
  }

  async deleteCoin(id: number): Promise<void> {
    void this.coinRepository.delete(id);
  }

  async create(createCoinDto: CreateCoinDto): Promise<void>{
      const targetCoin = await this.coinExchangeApoService.getCoin(createCoinDto.name)
      const coin = this.coinRepository.create({
        name: targetCoin.name,
        symbol: targetCoin.symbol,
        apiId: targetCoin.id,
      });
      await this.coinRepository.save(coin);

      // TODO: update rate here by second argument
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
