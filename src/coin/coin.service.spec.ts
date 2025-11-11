import { Test, TestingModule } from '@nestjs/testing';
import { CoinService } from './coin.service';
import { Coin } from './coin.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoinGateway } from './coin.gateway';
import { CoinExchangeApiService } from '../coin-exchange-rate/coin-exchange-api.service';
import { CoinExchangeRateService } from '../coin-exchange-rate/coin-exchange-rate.service';

describe('CoinService', () => {
  let service: CoinService;
  let coinRepository: Repository<Coin>;
  let coinGateway: CoinGateway;

  const mockCoinGateway = {
    server: {
      emit: jest.fn(),
    },
  };

  const mockCoinExchangeApiService = {
    getCoin: jest.fn(),
  };

  const mockCoinExchangeRateService = {
    updateCoinsRate: jest.fn(),
  };

  const mockCoinRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    }),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinService,
        { provide: getRepositoryToken(Coin), useValue: mockCoinRepository },
        { provide: CoinGateway, useValue: mockCoinGateway },
        {
          provide: CoinExchangeApiService,
          useValue: mockCoinExchangeApiService,
        },
        {
          provide: CoinExchangeRateService,
          useValue: mockCoinExchangeRateService,
        },
      ],
    }).compile();

    service = module.get<CoinService>(CoinService);
    coinRepository = module.get<Repository<Coin>>(getRepositoryToken(Coin));
    coinGateway = module.get<CoinGateway>(CoinGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return coins sorted by createdAt and exchangeRates sorted by createdAt', async () => {
      const mockCoins = [
        {
          createdAt: new Date(3),
          exchangeRates: [
            { createdAt: new Date(2) },
            { createdAt: new Date(4) }, // newest
          ],
        },
        {
          createdAt: new Date(1),
          exchangeRates: [{ createdAt: new Date(1) }],
        },
      ];
      (
        mockCoinRepository.createQueryBuilder().getMany as jest.Mock
      ).mockResolvedValue(mockCoins);

      const result = await service.findAll();

      // Coins sorted by createdAt DESC
      expect(result[0].createdAt.getTime()).toBeGreaterThan(
        result[1].createdAt.getTime(),
      );

      // ExchangeRates sorted by createdAt DESC
      expect(result[0].exchangeRates[0].createdAt.getTime()).toBeGreaterThan(
        result[0].exchangeRates[1].createdAt.getTime(),
      );
    });

    it('should apply name filter if provided', async () => {
      (
        mockCoinRepository.createQueryBuilder().getMany as jest.Mock
      ).mockResolvedValue([]);
      await service.findAll({ name: 'bitcoin' });
      expect(
        mockCoinRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalledWith('coin.name LIKE :name', { name: '%bitcoin%' });
    });
  });

  describe('create', () => {
    it('should create a coin and update exchange rate', async () => {
      const dto = { name: 'bitcoin' };
      const apiResponse = { name: 'Bitcoin', symbol: 'BTC', id: 'bitcoin' };

      mockCoinExchangeApiService.getCoin.mockResolvedValue(apiResponse);
      mockCoinRepository.create.mockImplementation((coinData) => coinData); // FIXED
      mockCoinRepository.save.mockResolvedValue({}); // optional

      await service.create(dto);

      expect(mockCoinExchangeApiService.getCoin).toHaveBeenCalledWith(
        'bitcoin',
      );
      expect(mockCoinRepository.create).toHaveBeenCalledWith({
        name: 'Bitcoin',
        symbol: 'BTC',
        apiId: 'bitcoin',
      });
      expect(mockCoinRepository.save).toHaveBeenCalledWith({
        name: 'Bitcoin',
        symbol: 'BTC',
        apiId: 'bitcoin',
      });
      expect(mockCoinExchangeRateService.updateCoinsRate).toHaveBeenCalledWith({
        name: 'Bitcoin',
      });
    });
  });

  describe('deleteCoin', () => {
    it('should call repository delete', async () => {
      await service.deleteCoin(1);
      expect(mockCoinRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('sendUpdate', () => {
    it('should emit update without fetching coins if action not rate_update', async () => {
      await service.sendUpdate({ action: 'other' });
      expect(coinGateway.server.emit).toHaveBeenCalledWith(
        CoinService.EVENTS.COIN_UPDATE,
        { action: 'other' },
      );
    });

    it('should fetch coins and emit if action is rate_update', async () => {
      const mockCoins = [{ name: 'Bitcoin' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockCoins as any);

      await service.sendUpdate({ action: 'rate_update' });

      expect(service.findAll).toHaveBeenCalled();
      expect(coinGateway.server.emit).toHaveBeenCalledWith(
        CoinService.EVENTS.COIN_UPDATE,
        {
          action: 'rate_update',
          coins: mockCoins,
        },
      );
    });
  });
});
