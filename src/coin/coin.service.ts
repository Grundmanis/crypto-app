import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { CreateCoinDto } from './coin.controller';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CoinGateway } from './coin.gateway';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly coinGateway: CoinGateway
  ) {}

  async findAll(): Promise<Coin[]> {
    return this.coinRepository
    .createQueryBuilder('coin')
    .leftJoinAndSelect('coin.exchangeRates', 'exchangeRate')
    .orderBy('exchangeRate.createdAt', 'DESC') // sort exchangeRates by createdAt
    .getMany();
  }

  async deleteCoin(id: number): Promise<void> {
    void this.coinRepository.delete(id)
  }

  async create(createCoinDto: CreateCoinDto) {
    try {
      // validate coint exists
      const observable$ = this.httpService.get(
        `${this.configService.get('API_URL')}/coins/${createCoinDto.name.toLowerCase()}?${this.configService.getOrThrow('API_AUTH_KEY')}=${this.configService.getOrThrow('API_KEY')}`,
      );
  
      // Convert Observable to Promise
      const response = await firstValueFrom(observable$);

      // assune we have data here
      const coin = this.coinRepository.create({
        name: response.data.name,
        symbol: response.data.symbol,
        apiId: response.data.id,
      });
      await this.coinRepository.save(coin);

    } catch (e) {
      console.log("e",e);
      throw new HttpException(e.response.data.error, HttpStatus.BAD_REQUEST);
    }
  }

  async sendUpdate(data: any) {
    if (data.action === "rateUpdate") {
      const coins = await this.findAll();
      data.coins = coins;
    }
    this.coinGateway.server.emit('coinUpdate', data);
  }
}
