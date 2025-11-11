import { Test, TestingModule } from '@nestjs/testing';
import {
  CoinExchangeRateService,
  CoinPrices,
} from './coin-exchange-rate.service';
import { CoinExchangeCronService } from './coin-exchange-cron.service';
import { CoinService } from '../coin/coin.service';
import { CoinExchangeApiService } from './coin-exchange-api.service';
import { Repository } from 'typeorm';
import { CoinExchangeRate } from './coin-exchange-rate.entity';
import { ConfigService } from '@nestjs/config';

describe('CoinExchangeRateService', () => {
  let service: CoinExchangeRateService;
  let mockRepo: Partial<Repository<CoinExchangeRate>>;
  let mockCoinService: Partial<CoinService>;
  let mockCoinApiService: Partial<CoinExchangeApiService>;
  let mockCronService: Partial<CoinExchangeCronService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockRepo = {
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      delete: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };

    mockCoinService = {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, apiId: 'bitcoin' },
        { id: 2, apiId: 'ethereum' },
      ]),
      sendUpdate: jest.fn(),
    };

    mockCoinApiService = {
      getCoinsCurrentPrice: jest.fn().mockResolvedValue({
        bitcoin: { eur: 50000 },
        ethereum: { eur: 3000 },
      }),
    };

    mockCronService = {
      startJob: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('10'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinExchangeRateService,
        { provide: CoinExchangeCronService, useValue: mockCronService },
        { provide: CoinService, useValue: mockCoinService },
        { provide: CoinExchangeApiService, useValue: mockCoinApiService },
        { provide: 'CoinExchangeRateRepository', useValue: mockRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    })
      .overrideProvider('CoinExchangeRateRepository')
      .useValue(mockRepo)
      .compile();

    service = module.get<CoinExchangeRateService>(CoinExchangeRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecord', () => {
    it('should save a coin exchange rate record', async () => {
      const data = { coinId: 1, currentPrice: { bitcoin: { eur: 50000 } } };
      await service.createRecord(data);

      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          coin: { id: 1 },
          currentPrice: data.currentPrice,
        }),
      );
    });
  });

  describe('updateCoinsRate', () => {
    it('should update coins rate and call sendUpdate', async () => {
      await service.updateCoinsRate();

      // Check createRecord called for each coin
      expect(mockRepo.save).toHaveBeenCalledTimes(2);

      // Check sendUpdate called at the end
      expect(mockCoinService.sendUpdate).toHaveBeenCalledWith({
        action: 'rate_update',
      });

      // Check API called with correct coins
      expect(mockCoinApiService.getCoinsCurrentPrice).toHaveBeenCalledWith(
        'bitcoin,ethereum',
      );
    });

    it('should skip coins not returned by API', async () => {
      jest
        .spyOn(mockCoinApiService, 'getCoinsCurrentPrice')
        .mockResolvedValueOnce({
          bitcoin: { eur: 50000 },
        });

      await service.updateCoinsRate();

      // Only bitcoin should be saved
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('trimHistory', () => {
    it('should delete old records beyond history limit', async () => {
      const mockRates = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(),
      }));
      (mockRepo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRates),
      });

      await (service as any).trimHistory(1);

      // Should delete 2 oldest records
      expect(mockRepo.delete).toHaveBeenCalledWith([11, 12]);
    });

    it('should not delete if records <= history limit', async () => {
      const mockRates = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        createdAt: new Date(),
      }));
      (mockRepo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRates),
      });

      await (service as any).trimHistory(1);

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all exchange rates', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockRepo.find = jest.fn().mockResolvedValue(mockData);

      const result = await service.findAll();
      expect(result).toEqual(mockData);
    });
  });
});
