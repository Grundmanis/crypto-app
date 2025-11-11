export type CoinCurrentPrice = {
  [coinId: string]: {
    [currency: string]: number;
  };
};
