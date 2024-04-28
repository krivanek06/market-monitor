import { PortfolioTransaction, SymbolSummary, USER_TEST_1_ID } from '@mm/api-types';

export const TestTransactionDates = {
  ['2023-09-04']: '2023-09-04',
  ['2023-09-05']: '2023-09-05',
  ['2023-09-06']: '2023-09-06',
  ['2023-09-07']: '2023-09-07',
  ['2023-09-08']: '2023-09-08',
  ['2023-09-11']: '2023-09-11',
  ['2023-09-12']: '2023-09-12',
} as const;

export const mockPortfolioTransaction = (input?: Partial<PortfolioTransaction>): PortfolioTransaction => {
  const data: PortfolioTransaction = {
    date: '2020-01-01',
    symbol: 'AAPL',
    transactionType: 'BUY',
    units: 0,
    symbolType: 'STOCK',
    returnChange: 0,
    returnValue: 0,
    transactionFees: 0,
    transactionId: new Date().getTime().toString(),
    unitPrice: 100,
    userId: USER_TEST_1_ID,
    sector: 'Technology',
    ...input,
  };

  return data;
};

export const mockSymbolSummaryAAPL: SymbolSummary = {
  id: 'AAPL',
  priceChange: {} as SymbolSummary['priceChange'],
  quote: {
    symbol: 'AAPL',
    price: 140,
    change: 14,
  } as SymbolSummary['quote'],
};

export const mockSymbolSummaryMSFT: SymbolSummary = {
  id: 'MSFT',
  priceChange: {} as SymbolSummary['priceChange'],
  quote: {
    symbol: 'MSFT',
    price: 140,
    change: 10,
  } as SymbolSummary['quote'],
};

export const testHistoricalPriceSymbol_AAPL = {
  symbol: 'AAPL',
  data: [
    {
      date: TestTransactionDates['2023-09-04'],
      volume: 1000,
      close: 10,
    },
    {
      date: TestTransactionDates['2023-09-05'],
      volume: 1000,
      close: 12,
    },
    {
      date: TestTransactionDates['2023-09-06'],
      volume: 1000,
      close: 10,
    },
    {
      date: TestTransactionDates['2023-09-07'],
      volume: 1000,
      close: 15,
    },
    {
      date: TestTransactionDates['2023-09-08'],
      volume: 1000,
      close: 10,
    },
    // no data for 2023-09-09 and 2023-09-10 - weekends
    {
      date: TestTransactionDates['2023-09-11'],
      volume: 1000,
      close: 10,
    },
    {
      date: TestTransactionDates['2023-09-12'],
      volume: 1000,
      close: 11,
    },
  ],
} as const;

export const testHistoricalPriceSymbol_MSFT = {
  symbol: 'MSFT',
  data: [
    {
      date: TestTransactionDates['2023-09-07'],
      volume: 1000,
      close: 20,
    },
    {
      date: TestTransactionDates['2023-09-08'],
      volume: 1000,
      close: 22,
    },
    // no data for 2023-09-09 and 2023-09-10 - weekends
    {
      date: TestTransactionDates['2023-09-11'],
      volume: 1000,
      close: 30,
    },
    {
      date: TestTransactionDates['2023-09-12'],
      volume: 1000,
      close: 31,
    },
  ],
} as const;
