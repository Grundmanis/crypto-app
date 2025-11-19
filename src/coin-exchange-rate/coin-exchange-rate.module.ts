import { forwardRef, Module } from '@nestjs/common';
import { CoinExchangeRateService } from './services/coin-exchange-rate.service';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoinModule } from 'src/coin/coin.module';
import { CoinExchangeCronService } from './services/coin-exchange-cron.service';
import { CoinExchangeApiService } from './services/coin-exchange-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinExchangeRate]),
    HttpModule,
    forwardRef(() => CoinModule),
  ],
  controllers: [],
  providers: [
    CoinExchangeRateService,
    CoinExchangeCronService,
    CoinExchangeApiService,
  ],
  exports: [CoinExchangeRateService, CoinExchangeApiService],
})
export class CoinExchangeRateModule {}
