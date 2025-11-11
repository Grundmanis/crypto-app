import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CoinExchangeRateService } from './coin-exchange-rate.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class CoinExchangeCronService {
  private readonly logger = new Logger(CoinExchangeCronService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => CoinExchangeRateService))
    private readonly coinExchangeRateService: CoinExchangeRateService,
  ) {}

  startJob(seconds: number) {
    const cronExpression = `${seconds} * * * * *`;

    const job = new CronJob(cronExpression, () => {
      this.logger.warn(
        `time (${seconds}) for job ${CoinExchangeCronService.name} to run!`,
      );
      this.logger.debug(`${CoinExchangeCronService.name} cron started`);
      this.coinExchangeRateService.updateCoinsRate();
    });

    this.schedulerRegistry.addCronJob(CoinExchangeCronService.name, job);
    job.start();
    this.logger.warn(
      `job ${CoinExchangeCronService.name} added for each minute at ${seconds} seconds!`,
    );
  }
}
