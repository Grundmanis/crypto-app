import { Test, TestingModule } from '@nestjs/testing';
import { CoinExchangeApiService } from './coin-exchange-api.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';

describe('CoinExchangeApiService', () => {
  let service: CoinExchangeApiService;
  let configService: ConfigService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinExchangeApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<CoinExchangeApiService>(CoinExchangeApiService);
    configService = module.get(ConfigService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCoin', () => {
    it('should call makeRequest with correct URL', async () => {
      const mockResponse = { name: 'Bitcoin', symbol: 'BTC', id: 'bitcoin' };
      jest.spyOn(service as any, 'makeRequest').mockResolvedValue(mockResponse);

      const result = await service.getCoin('Bitcoin');

      expect(result).toEqual(mockResponse);
      expect((service as any).makeRequest).toHaveBeenCalledWith(
        '/coins/bitcoin',
      );
    });
  });

  describe('getCoinsCurrentPrice', () => {
    it('should call makeRequest with correct URL and query', async () => {
      const mockResponse = { bitcoin: { eur: 50000 } };
      jest.spyOn(service as any, 'makeRequest').mockResolvedValue(mockResponse);

      const result = await service.getCoinsCurrentPrice('bitcoin', 'eur');

      expect(result).toEqual(mockResponse);
      expect((service as any).makeRequest).toHaveBeenCalledWith(
        '/simple/price/',
        {
          ids: 'bitcoin',
          vs_currencies: 'eur',
        },
      );
    });

    it('should default to eur if no targetCurrencies provided', async () => {
      const mockResponse = { bitcoin: { eur: 50000 } };
      jest.spyOn(service as any, 'makeRequest').mockResolvedValue(mockResponse);

      const result = await service.getCoinsCurrentPrice('bitcoin');

      expect(result).toEqual(mockResponse);
      expect((service as any).makeRequest).toHaveBeenCalledWith(
        '/simple/price/',
        {
          ids: 'bitcoin',
          vs_currencies: 'eur',
        },
      );
    });
  });

  describe('makeRequest', () => {
    it('should make HTTP GET request and return data', async () => {
      mockConfigService.get.mockReturnValue('http://api.test');
      mockConfigService.getOrThrow
        .mockReturnValueOnce('authKey')
        .mockReturnValueOnce('authValue');

      const mockData = { success: true };
      mockHttpService.get.mockReturnValue(of({ data: mockData }));

      const result = await (service as any).makeRequest('/test', {
        foo: 'bar',
      });

      expect(result).toEqual(mockData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'http://api.test/test?authKey=authValue&foo=bar',
      );
    });

    it('should throw HttpException if request fails', async () => {
      mockConfigService.get.mockReturnValue('http://api.test');
      mockConfigService.getOrThrow
        .mockReturnValueOnce('authKey')
        .mockReturnValueOnce('authValue');

      const errorResponse = { response: { data: { error: 'Not Found' } } };
      mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect((service as any).makeRequest('/test')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
