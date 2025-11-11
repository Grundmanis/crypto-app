import { forwardRef, Module } from '@nestjs/common';
import { CoinExchangeRateService } from './coin-exchange-rate.service';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoinModule } from 'src/coin/coin.module';
import { CoinExchangeCronService } from './coin-exchange-cron.service';
import { CoinExchangeApiService } from './coin-exchange-api.service';

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
