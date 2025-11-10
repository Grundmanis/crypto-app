import { Test, TestingModule } from '@nestjs/testing';
import { CoinExchangeRateService } from './coin-exchange-rate.service';

describe('CoinExchangeRateService', () => {
  let service: CoinExchangeRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinExchangeRateService],
    }).compile();

    service = module.get<CoinExchangeRateService>(CoinExchangeRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
