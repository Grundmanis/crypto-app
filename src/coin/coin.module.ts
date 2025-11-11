import { forwardRef, Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinController } from './coin.controller';
import { Coin } from './coin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeRateModule } from 'src/coin-exchange-rate/coin-exchange-rate.module';
import { redisProvider } from 'src/redis.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coin]),
    HttpModule,
    forwardRef(() => CoinExchangeRateModule),
  ],
  providers: [CoinService, CoinGateway, redisProvider],
  controllers: [CoinController],
  exports: [CoinService],
})
export class CoinModule {}
