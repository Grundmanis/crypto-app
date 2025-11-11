import { Coin } from '../coin/coin.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { CoinPrices } from './coin-exchange-rate.service';

@Entity()
export class CoinExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coin, (coin) => coin.exchangeRates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coinId' })
  coin: Coin;

  @Column({ type: 'json' })
  currentPrice: CoinPrices;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
