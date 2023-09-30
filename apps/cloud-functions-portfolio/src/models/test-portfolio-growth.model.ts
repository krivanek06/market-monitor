import { HistoricalPriceSymbol, PortfolioGrowthAssets, UserPortfolioTransaction } from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/utils-general';
import { mockPortfolioTransaction } from './test-transaction.model';

export const TestTransactionDates = {
  ['2023-09-04']: '2023-09-04',
  ['2023-09-05']: '2023-09-05',
  ['2023-09-06']: '2023-09-06',
  ['2023-09-07']: '2023-09-07',
  ['2023-09-08']: '2023-09-08',
  ['2023-09-11']: '2023-09-11',
  ['2023-09-12']: '2023-09-12',
} as const;

const testTransaction_BUY_AAPL_1 = mockPortfolioTransaction({
  symbol: 'AAPL',
  units: 5,
  date: TestTransactionDates['2023-09-04'],
  transactionType: 'BUY',
  unitPrice: 40,
});

const testTransaction_BUY_AAPL_2 = mockPortfolioTransaction({
  symbol: 'AAPL',
  units: 10,
  date: TestTransactionDates['2023-09-06'],
  transactionType: 'BUY',
  unitPrice: 200,
});

const testTransaction_SELL_AAPL_1 = mockPortfolioTransaction({
  symbol: 'AAPL',
  units: 5,
  date: TestTransactionDates['2023-09-11'],
  transactionType: 'SELL',
  unitPrice: 60,
});

const testTransaction_BUY_MSFT_1 = mockPortfolioTransaction({
  symbol: 'MSFT',
  units: 10,
  date: TestTransactionDates['2023-09-07'],
  transactionType: 'BUY',
  unitPrice: 80,
});

const testTransaction_SELL_MSFT_1 = mockPortfolioTransaction({
  symbol: 'MSFT',
  units: 10,
  date: TestTransactionDates['2023-09-08'],
  transactionType: 'SELL',
  unitPrice: 90,
});

export const userTestPortfolioTransaction1 = {
  cashDeposit: [],
  transactions: [
    testTransaction_BUY_AAPL_1,
    testTransaction_BUY_MSFT_1,
    testTransaction_BUY_AAPL_2,
    testTransaction_SELL_AAPL_1,
    testTransaction_SELL_MSFT_1,
  ],
} satisfies UserPortfolioTransaction;

// ================ // historical prices for symbols

//const yesterDay = '2023-09-15';
export const testHistoricalPriceSymbol_AAPL: HistoricalPriceSymbol = {
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
};

export const testHistoricalPriceSymbol_MSFT: HistoricalPriceSymbol = {
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
};

// ================ // create portfolio growth assets result

export const expectedResult: PortfolioGrowthAssets[] = [
  {
    symbol: testTransaction_BUY_AAPL_1.symbol,
    data: [
      {
        date: TestTransactionDates['2023-09-04'],
        units: testTransaction_BUY_AAPL_1.units,
        marketTotalValue: testHistoricalPriceSymbol_AAPL.data[0].close * testTransaction_BUY_AAPL_1.units,
        investedValue: testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units,
      },
      {
        date: TestTransactionDates['2023-09-05'],
        units: testTransaction_BUY_AAPL_1.units,
        marketTotalValue: testHistoricalPriceSymbol_AAPL.data[1].close * testTransaction_BUY_AAPL_1.units,
        investedValue: testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units,
      },
      {
        date: TestTransactionDates['2023-09-06'],
        units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units,
        marketTotalValue:
          testHistoricalPriceSymbol_AAPL.data[2].close *
          (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units),
        investedValue:
          testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units +
          testTransaction_BUY_AAPL_2.unitPrice * testTransaction_BUY_AAPL_2.units,
      },
      {
        date: TestTransactionDates['2023-09-07'],
        units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units,
        marketTotalValue:
          testHistoricalPriceSymbol_AAPL.data[3].close *
          (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units),
        investedValue:
          testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units +
          testTransaction_BUY_AAPL_2.unitPrice * testTransaction_BUY_AAPL_2.units,
      },
      {
        date: TestTransactionDates['2023-09-08'],
        units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units,
        marketTotalValue:
          testHistoricalPriceSymbol_AAPL.data[4].close *
          (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units),
        investedValue:
          testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units +
          testTransaction_BUY_AAPL_2.unitPrice * testTransaction_BUY_AAPL_2.units,
      },
      // no data for 2023-09-09 and 2023-09-10 - weekends
      {
        date: TestTransactionDates['2023-09-11'],
        units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units,
        marketTotalValue:
          testHistoricalPriceSymbol_AAPL.data[5].close *
          (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units),
        investedValue: roundNDigits(
          ((testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units +
            testTransaction_BUY_AAPL_2.unitPrice * testTransaction_BUY_AAPL_2.units) /
            (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units)) *
            (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units),
        ),
      },
      {
        date: TestTransactionDates['2023-09-12'],
        units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units,
        marketTotalValue:
          testHistoricalPriceSymbol_AAPL.data[6].close *
          (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units),
        investedValue: roundNDigits(
          ((testTransaction_BUY_AAPL_1.unitPrice * testTransaction_BUY_AAPL_1.units +
            testTransaction_BUY_AAPL_2.unitPrice * testTransaction_BUY_AAPL_2.units) /
            (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units)) *
            (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units),
        ),
      },
    ],
  },
  {
    symbol: testTransaction_BUY_MSFT_1.symbol,
    data: [
      {
        date: TestTransactionDates['2023-09-07'],
        units: testTransaction_BUY_MSFT_1.units,
        marketTotalValue: testHistoricalPriceSymbol_MSFT.data[0].close * testTransaction_BUY_MSFT_1.units,
        investedValue: testTransaction_BUY_MSFT_1.unitPrice * testTransaction_BUY_MSFT_1.units,
      },
    ],
  },
];
