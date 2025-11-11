import { Coin } from '../coin/coin.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class CoinExchangeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coin, (coin) => coin.exchangeRates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coinId' })
  coin: Coin;

  @Column({ type: 'json' })
  currentPrice: { [currency: string]: number };

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
