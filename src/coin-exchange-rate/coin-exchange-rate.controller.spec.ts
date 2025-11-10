import { Test, TestingModule } from '@nestjs/testing';
import { CoinExchangeRateController } from './coin-exchange-rate.controller';

describe('CoinExchangeRateController', () => {
  let controller: CoinExchangeRateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinExchangeRateController],
    }).compile();

    controller = module.get<CoinExchangeRateController>(
      CoinExchangeRateController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
