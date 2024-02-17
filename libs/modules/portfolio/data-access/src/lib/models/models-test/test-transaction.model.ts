import {
  PortfolioState,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  SymbolSummary,
} from '@market-monitor/api-types';
import { getYesterdaysDate } from '@market-monitor/shared/features/general-util';
import { USER_TEST_1_ID } from './test-user.model';

export const TestTransactionDates = {
  ['2023-09-04']: '2023-09-04',
  ['2023-09-05']: '2023-09-05',
  ['2023-09-06']: '2023-09-06',
  ['2023-09-07']: '2023-09-07',
  ['2023-09-08']: '2023-09-08',
  ['2023-09-11']: '2023-09-11',
  ['2023-09-12']: '2023-09-12',
} as const;

export const mockCreatePortfolioTransactionCreate = (
  input?: Partial<PortfolioTransactionCreate>,
): PortfolioTransactionCreate => {
  const data: PortfolioTransactionCreate = {
    date: '2020-01-01',
    symbol: 'AAPL',
    transactionType: 'BUY',
    units: 1,
    symbolType: 'STOCK',
    ...input,
  };

  return data;
};

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
    ...input,
  };

  return data;
};

export const testTransactionCreate_BUY_AAPL_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 10,
  date: TestTransactionDates['2023-09-04'],
  transactionType: 'BUY',
});

export const testTransaction_BUY_AAPL_1 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_AAPL_1.symbol,
  units: testTransactionCreate_BUY_AAPL_1.units,
  date: testTransactionCreate_BUY_AAPL_1.date,
  transactionType: testTransactionCreate_BUY_AAPL_1.transactionType,
  unitPrice: 100,
});

export const testTransactionCreate_BUY_AAPL_2 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 5,
  date: TestTransactionDates['2023-09-11'],
  transactionType: 'BUY',
});

export const testTransaction_BUY_AAPL_2 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_AAPL_2.symbol,
  units: testTransactionCreate_BUY_AAPL_2.units,
  date: testTransactionCreate_BUY_AAPL_2.date,
  transactionType: testTransactionCreate_BUY_AAPL_2.transactionType,
  unitPrice: 120,
  transactionFees: 0.2,
});

export const testTransactionCreate_SELL_AAPL_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 5,
  date: TestTransactionDates['2023-09-12'],
  transactionType: 'SELL',
});

export const testTransaction_SELL_AAPL_1 = mockPortfolioTransaction({
  symbol: testTransactionCreate_SELL_AAPL_1.symbol,
  units: testTransactionCreate_SELL_AAPL_1.units,
  date: testTransactionCreate_SELL_AAPL_1.date,
  transactionType: testTransactionCreate_SELL_AAPL_1.transactionType,
  unitPrice: 130,
  transactionFees: 0.5,
});

export const testTransactionCreate_BUY_MSFT_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'MSFT',
  units: 10,
  date: TestTransactionDates['2023-09-07'],
  transactionType: 'BUY',
});

export const testTransaction_BUY_MSFT_1 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_MSFT_1.symbol,
  units: testTransactionCreate_BUY_MSFT_1.units,
  date: testTransactionCreate_BUY_MSFT_1.date,
  transactionType: testTransactionCreate_BUY_MSFT_1.transactionType,
  unitPrice: 85.5,
});

export const mockSymbolSummaryAAPL: SymbolSummary = {
  id: 'AAPL',
  priceChange: {} as SymbolSummary['priceChange'],
  quote: {
    symbol: 'AAPL',
    price: 140,
  } as SymbolSummary['quote'],
};

export const mockSymbolSummaryMSFT: SymbolSummary = {
  id: 'MSFT',
  priceChange: {} as SymbolSummary['priceChange'],
  quote: {
    symbol: 'MSFT',
    price: 140,
  } as SymbolSummary['quote'],
};

export const testPreviousTransactionEmpty: PortfolioState = {
  accountResetDate: '2023-09-01',
  balance: 0,
  cashOnHand: 0,
  date: getYesterdaysDate(),
  firstTransactionDate: null,
  holdingsBalance: 0,
  invested: 0,
  lastTransactionDate: null,
  numberOfExecutedBuyTransactions: 0,
  numberOfExecutedSellTransactions: 0,
  previousBalanceChange: 0,
  previousBalanceChangePercentage: 0,
  startingCash: 0,
  totalGainsPercentage: 0,
  totalGainsValue: 0,
  transactionFees: 0,
};

export const testPreviousTransactionNonEmpty: PortfolioState = {
  accountResetDate: '2023-09-01',
  balance: 12_000,
  cashOnHand: 10_000,
  date: getYesterdaysDate(),
  firstTransactionDate: '2023-09-01',
  holdingsBalance: 0,
  invested: 2000,
  lastTransactionDate: '2023-09-01',
  numberOfExecutedBuyTransactions: 10,
  numberOfExecutedSellTransactions: 10,
  previousBalanceChange: 0,
  previousBalanceChangePercentage: 0,
  startingCash: 0,
  totalGainsPercentage: 0,
  totalGainsValue: 0,
  transactionFees: 10,
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
      close: 10,
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
