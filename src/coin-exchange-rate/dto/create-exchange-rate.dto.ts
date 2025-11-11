export class CreateExchangeRateDto {
  coinId: number;
  currentPrice: {
    [currency: string]: number;
  };
}