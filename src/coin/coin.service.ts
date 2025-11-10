import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { CreateCoinDto } from './coin.controller';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async findAll(): Promise<Coin[]> {
    return this.coinRepository.find();
  }

  async create(createCoinDto: CreateCoinDto) {
    try {
      console.log({createCoinDto});
      // validate coint exists
      const observable$ = this.httpService.get(
        `${this.configService.get('API_URL')}/coins/${createCoinDto.name.toLowerCase()}?${this.configService.getOrThrow('API_AUTH_KEY')}=${this.configService.getOrThrow('API_KEY')}`,
      );
  
      // Convert Observable to Promise
      const response = await firstValueFrom(observable$);
  
      console.log("response.data", response.data.error);

    } catch (e) {
      // throw error
      console.log(e);
    }
  }
}
