import { Module } from '@nestjs/common';
import { CoinExchangeRateController } from './coin-exchange-rate.controller';
import { CoinExchangeRateService } from './coin-exchange-rate.service';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoinModule } from 'src/coin/coin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinExchangeRate]),
    HttpModule,
    CoinModule,
  ],
  controllers: [CoinExchangeRateController],
  providers: [CoinExchangeRateService],
  exports: [CoinExchangeRateService],
})
export class CoinExchangeRateModule {}
