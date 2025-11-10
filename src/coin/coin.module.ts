import { Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { Coin } from './coin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeApiService } from 'src/coin-exchange-rate/coin-exchange-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coin]), HttpModule],
  providers: [CoinService, CoinExchangeApiService, CoinGateway],
  controllers: [CoinController],
  exports: [CoinService, CoinExchangeApiService],
})
export class CoinModule {}
