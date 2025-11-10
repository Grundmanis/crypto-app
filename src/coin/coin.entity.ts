import { CoinExchangeRate } from 'src/coin-exchange-rate/coin-exchange-rate.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Coin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  symbol: string;

  @Column()
  name: string;

  @Column({ unique: true })
  apiId: string;

  @OneToMany(() => CoinExchangeRate, (exchangeRate) => exchangeRate.coin)
  exchangeRates: CoinExchangeRate[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
