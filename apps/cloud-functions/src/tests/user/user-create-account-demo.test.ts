import {
  mockPortfolioTransaction,
  PortfolioGrowth,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
  TestTransactionDates,
  USER_DEFAULT_STARTING_CASH,
} from '@mm/api-types';
import { getPortfolioGrowthAssets, roundNDigits } from '@mm/shared/general-util';
import { CreateDemoAccountService } from '../../user/user-create-account-demo';

describe('CreateDemoAccountService', () => {
  let service: CreateDemoAccountService;

  beforeEach(() => {
    service = new CreateDemoAccountService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: getPortfolioGrowth', () => {
    it('should calculate growth with starting cash on hand', async () => {
      // mock some data
      service['symbolHistoricalPrices'].set(testHistoricalPriceSymbol_AAPL.symbol, testHistoricalPriceSymbol_AAPL.data);
      service['symbolHistoricalPrices'].set(testHistoricalPriceSymbol_MSFT.symbol, testHistoricalPriceSymbol_MSFT.data);

      const t_BUY_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const t_BUY_AAPL_2 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-11'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const t_SELL_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-12'],
        transactionType: 'SELL',
        unitPrice: 130,
        transactionFees: 0.5,
      });

      const t_BUY_MSFT_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_MSFT.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-07'],
        transactionType: 'BUY',
        unitPrice: 85.5,
      });

      const historicalPrices = {
        [testHistoricalPriceSymbol_AAPL.symbol]: testHistoricalPriceSymbol_AAPL.data,
        [testHistoricalPriceSymbol_MSFT.symbol]: testHistoricalPriceSymbol_MSFT.data,
      };
      const portfolioGrowthAssets = getPortfolioGrowthAssets(
        [t_BUY_AAPL_1, t_BUY_AAPL_2, t_SELL_AAPL_1, t_BUY_MSFT_1],
        historicalPrices,
      );

      const portfolioGrowth = service.getPortfolioGrowth(portfolioGrowthAssets, USER_DEFAULT_STARTING_CASH);

      const expectedResult = [
        {
          date: TestTransactionDates['2023-09-04'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-05'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-06'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-07'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            (t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-08'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            (t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-11'],
          investedTotal:
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close,
          balanceTotal:
            USER_DEFAULT_STARTING_CASH +
            ((t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units -
              t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-12'],
          investedTotal: roundNDigits(
            // break even price
            ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) +
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          ),
          marketTotal:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
              testHistoricalPriceSymbol_AAPL.data[6].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close,
          balanceTotal: roundNDigits(
            USER_DEFAULT_STARTING_CASH +
              ((t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
                testHistoricalPriceSymbol_AAPL.data[6].close -
                // break even price
                ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units)) +
              (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close -
                t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units) -
              t_SELL_AAPL_1.transactionFees,
          ),
        },
      ] satisfies PortfolioGrowth[];

      expect(portfolioGrowth[0]).toEqual(expectedResult[0]);
      expect(portfolioGrowth[1]).toEqual(expectedResult[1]);
      expect(portfolioGrowth[2]).toEqual(expectedResult[2]);
      expect(portfolioGrowth[3]).toEqual(expectedResult[3]);
      expect(portfolioGrowth[4]).toEqual(expectedResult[4]);
      expect(portfolioGrowth[5]).toEqual(expectedResult[5]);
      expect(portfolioGrowth[6]).toEqual(expectedResult[6]);
    });

    it('should calculate growth without starting cash', async () => {
      // mock some data
      service['symbolHistoricalPrices'].set(testHistoricalPriceSymbol_AAPL.symbol, testHistoricalPriceSymbol_AAPL.data);
      service['symbolHistoricalPrices'].set(testHistoricalPriceSymbol_MSFT.symbol, testHistoricalPriceSymbol_MSFT.data);

      const t_BUY_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const t_BUY_AAPL_2 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-11'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const t_SELL_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-12'],
        transactionType: 'SELL',
        unitPrice: 130,
        transactionFees: 0.5,
      });

      const t_BUY_MSFT_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_MSFT.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-07'],
        transactionType: 'BUY',
        unitPrice: 85.5,
      });

      const historicalPrices = {
        [testHistoricalPriceSymbol_AAPL.symbol]: testHistoricalPriceSymbol_AAPL.data,
        [testHistoricalPriceSymbol_MSFT.symbol]: testHistoricalPriceSymbol_MSFT.data,
      };
      const portfolioGrowthAssets = getPortfolioGrowthAssets(
        [t_BUY_AAPL_1, t_BUY_AAPL_2, t_SELL_AAPL_1, t_BUY_MSFT_1],
        historicalPrices,
      );

      // make calculation
      const portfolioGrowth = service.getPortfolioGrowth(portfolioGrowthAssets, 0);

      const expectedResult = [
        {
          date: TestTransactionDates['2023-09-04'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
          balanceTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-05'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
          balanceTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-06'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
          balanceTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-07'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close,
          balanceTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-08'],
          investedTotal: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close,
          balanceTotal:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-11'],
          investedTotal:
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotal:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close,
          balanceTotal:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units -
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-12'],
          investedTotal: roundNDigits(
            // break even price
            ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) +
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          ),
          marketTotal:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
              testHistoricalPriceSymbol_AAPL.data[6].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close,
          balanceTotal: roundNDigits(
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
              testHistoricalPriceSymbol_AAPL.data[6].close -
              // break even price
              ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) +
              (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close -
                t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units) -
              t_SELL_AAPL_1.transactionFees,
          ),
        },
      ] satisfies PortfolioGrowth[];

      expect(portfolioGrowth[0]).toEqual(expectedResult[0]);
      expect(portfolioGrowth[1]).toEqual(expectedResult[1]);
      expect(portfolioGrowth[2]).toEqual(expectedResult[2]);
      expect(portfolioGrowth[3]).toEqual(expectedResult[3]);
      expect(portfolioGrowth[4]).toEqual(expectedResult[4]);
      expect(portfolioGrowth[5]).toEqual(expectedResult[5]);
      expect(portfolioGrowth[6]).toEqual(expectedResult[6]);
    });
  });
});
