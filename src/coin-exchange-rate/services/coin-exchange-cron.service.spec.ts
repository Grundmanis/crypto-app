import { Test, TestingModule } from '@nestjs/testing';
import { CoinExchangeCronService } from './coin-exchange-cron.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CoinExchangeRateService } from './coin-exchange-rate.service';
import { CronJob } from 'cron';

describe('CoinExchangeCronService', () => {
  let service: CoinExchangeCronService;
  let schedulerRegistry: SchedulerRegistry;
  let coinExchangeRateService: CoinExchangeRateService;

  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
  };

  const mockCoinExchangeRateService = {
    updateCoinsRate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinExchangeCronService,
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
        {
          provide: CoinExchangeRateService,
          useValue: mockCoinExchangeRateService,
        },
      ],
    }).compile();

    service = module.get<CoinExchangeCronService>(CoinExchangeCronService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    coinExchangeRateService = module.get<CoinExchangeRateService>(
      CoinExchangeRateService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and start a cron job', () => {
    const spyCronJob = jest.spyOn(CronJob.prototype, 'start');

    const seconds = 30;
    service.startJob(seconds);

    // CronJob added to scheduler registry
    expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalledTimes(1);
    expect(mockSchedulerRegistry.addCronJob).toHaveBeenCalledWith(
      'CoinExchangeCronService',
      expect.any(CronJob),
    );

    // CronJob started
    expect(spyCronJob).toHaveBeenCalled();

    // Test the job function directly
    const cronJobInstance = mockSchedulerRegistry.addCronJob.mock.calls[0][1];
    cronJobInstance.fireOnTick(); // manually trigger the job

    expect(mockCoinExchangeRateService.updateCoinsRate).toHaveBeenCalled();
  });
});
