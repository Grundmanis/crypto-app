import { Test, TestingModule } from '@nestjs/testing';
import { CoinController } from './coin.controller';
import { CoinService } from './services/coin.service';
import { Coin } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';

describe('CoinController', () => {
  let controller: CoinController;
  let service: CoinService;

  const mockCoinService = {
    findAll: jest.fn(),
    create: jest.fn(),
    deleteCoin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinController],
      providers: [
        {
          provide: CoinService,
          useValue: mockCoinService,
        },
      ],
    }).compile();

    controller = module.get<CoinController>(CoinController);
    service = module.get<CoinService>(CoinService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCoins', () => {
    it('should return array of coins', async () => {
      const coins: Coin[] = [
        { id: 1, name: 'Bitcoin' } as Coin,
        { id: 2, name: 'Ethereum' } as Coin,
      ];

      mockCoinService.findAll.mockResolvedValue(coins);

      const result = await controller.getCoins();
      expect(result).toEqual(coins);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('saveCoin', () => {
    it('should call create with DTO', async () => {
      const dto: CreateCoinDto = { name: 'Litecoin' };

      mockCoinService.create.mockResolvedValue(undefined);

      await controller.saveCoin(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('deleteCoin', () => {
    it('should call deleteCoin with id', async () => {
      mockCoinService.deleteCoin.mockResolvedValue(undefined);

      await controller.deleteCoin(42);

      expect(service.deleteCoin).toHaveBeenCalledWith(42);
    });
  });
});
