import { Test, TestingModule } from '@nestjs/testing';
import { CoinService } from './coin.service';
import { CoinExchangeApiService } from '../coin-exchange-rate/coin-exchange-api.service';
import { CoinExchangeRateService } from '../coin-exchange-rate/coin-exchange-rate.service';
import { CoinGateway } from './coin.gateway';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';

describe('CoinService', () => {
  let service: CoinService;
  let repo: Repository<Coin>;
  let redis: Redis;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockCoinGateway = {
    server: { emit: jest.fn() },
  };

  const mockApiService = { getCoin: jest.fn() };
  const mockExchangeRateService = { updateCoinsRate: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinService,
        { provide: getRepositoryToken(Coin), useValue: mockRepo },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: CoinGateway, useValue: mockCoinGateway },
        { provide: CoinExchangeApiService, useValue: mockApiService },
        { provide: CoinExchangeRateService, useValue: mockExchangeRateService },
      ],
    }).compile();

    service = module.get<CoinService>(CoinService);
    repo = module.get<Repository<Coin>>(getRepositoryToken(Coin));
    redis = module.get<Redis>('REDIS_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached coins if exists', async () => {
      const coins = [{ id: 1, name: 'Bitcoin', exchangeRates: [] }];
      mockRedis.get.mockResolvedValue(JSON.stringify(coins));

      const result = await service.findAll();
      expect(result).toEqual(coins);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should fetch from DB and set cache if cache miss', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, name: 'Bitcoin', exchangeRates: [] },
        ]),
      };
      
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await service.findAll();
      expect(result).toEqual([{ id: 1, name: 'Bitcoin', exchangeRates: [] }]);
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a coin and update rate', async () => {
      const dto: CreateCoinDto = { name: 'bitcoin' };
      mockApiService.getCoin.mockResolvedValue({
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
      });
      mockRepo.create.mockReturnValue({ name: 'Bitcoin', symbol: 'BTC', apiId: 'bitcoin' });

      await service.create(dto);

      expect(mockApiService.getCoin).toHaveBeenCalledWith('bitcoin');
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(mockExchangeRateService.updateCoinsRate).toHaveBeenCalledWith({ name: 'Bitcoin' });
    });
  });

  describe('deleteCoin', () => {
    it('should call repository delete', async () => {
      mockRepo.findOne.mockReturnValue({ name: 'Bitcoin', symbol: 'BTC', apiId: 'bitcoin' });

      await service.deleteCoin(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('sendUpdate', () => {
    it('should emit rate_update event with coins', async () => {
      const coins = [{ id: 1, name: 'Bitcoin', exchangeRates: [] }];
      // @ts-ignore
      jest.spyOn(service, 'findAll').mockResolvedValue(coins);

      await service.sendUpdate({ action: 'rate_update' });
      expect(mockCoinGateway.server.emit).toHaveBeenCalledWith(
        CoinService.EVENTS.COIN_UPDATE,
        { action: 'rate_update', coins },
      );
    });
  });
});