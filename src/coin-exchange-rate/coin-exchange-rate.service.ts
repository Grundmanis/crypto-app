import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoinExchangeRateService {

  constructor(
    @InjectRepository(CoinExchangeRate)
    private readonly coinExchangeRateRepository: Repository<CoinExchangeRate>
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
}
