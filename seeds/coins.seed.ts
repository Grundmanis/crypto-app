// seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { Coin } from '../src/coin/coin.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const coinRepository = app.get('CoinRepository') as Repository<Coin>;

  const coins = [
    { name: 'Bitcoin', symbol: 'BTC', apiId: 'bitcoin' },
    { name: 'Ethereum', symbol: 'ETH', apiId: 'ethereum' },
  ];

  for (const data of coins) {
    const coin = coinRepository.create(data);
    await coinRepository.save(coin);
    console.log(`Created coin: ${coin.name}`);
  }

  await app.close();
}

bootstrap();
