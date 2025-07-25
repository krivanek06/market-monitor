import {
  mockPortfolioTransaction,
  OutstandingOrder,
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioState,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
  TestTransactionDates,
  USER_DEFAULT_STARTING_CASH,
} from '@mm/api-types';
import { calculateGrowth, roundNDigits } from '../general-function.util';
import {
  createEmptyPortfolioState,
  getPortfolioGrowth,
  getPortfolioGrowthAssets,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  recalculatePortfolioStateByTransactions,
} from '../portfolio.util';

describe('PortfolioUtil', () => {
  describe('test: getPortfolioGrowthAssets()', () => {
    it('should return empty array for empty input', () => {
      const result = getPortfolioGrowthAssets([], {});
      expect(result).toEqual([]);
    });

    it('should return portfolio asset growth for one transaction with transaction fees', () => {
      const t1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
        transactionFees: 0.25,
      });

      const expectedResult = {
        symbol: t1.symbol,
        displaySymbol: t1.symbol,
        data: testHistoricalPriceSymbol_AAPL.data.map((d) => ({
          date: d.date,
          investedTotal: t1.units * t1.unitPrice,
          units: t1.units,
          marketTotal: t1.units * d.close,
          accumulatedReturn: -t1.transactionFees,
          profit: t1.units * d.close - t1.units * t1.unitPrice - t1.transactionFees,
        })),
      } satisfies PortfolioGrowthAssets;

      const result = getPortfolioGrowthAssets([t1], {
        [t1.symbol]: testHistoricalPriceSymbol_AAPL.data,
      });

      expect(result).toEqual([expectedResult]);
    });

    it('should return portfolio asset growth for multiple transaction', () => {
      const t_BUY_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
        transactionFees: 0.25,
      });
      const t_BUY_AAPL_2 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-11'],
        transactionType: 'BUY',
        unitPrice: 120,
        transactionFees: 0.2,
      });
      const t_SELL_AAPL_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 5,
        date: TestTransactionDates['2023-09-12'],
        transactionType: 'SELL',
        unitPrice: 130,
        transactionFees: 0.5,
        returnValue: 300, // random number
        returnChange: 9.22, // random number
      });
      const t_BUY_MSFT_1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_MSFT.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-07'],
        transactionType: 'BUY',
        unitPrice: 85.5,
        transactionFees: 0.1,
      });

      const expectedResult = [
        {
          data: [
            {
              date: TestTransactionDates['2023-09-04'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-05'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-06'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-07'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotal: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              investedTotal: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice + t_BUY_AAPL_2.units * t_BUY_AAPL_2.unitPrice,
              marketTotal: (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close,
              units: t_BUY_AAPL_1.units + t_BUY_AAPL_2.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees - t_BUY_AAPL_2.transactionFees,
              profit:
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_2.units * t_BUY_AAPL_2.unitPrice -
                t_BUY_AAPL_1.transactionFees -
                t_BUY_AAPL_2.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              investedTotal: roundNDigits(
                // break even price
                ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units),
              ),
              marketTotal:
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
                testHistoricalPriceSymbol_AAPL.data[6].close,
              units: t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units,
              accumulatedReturn:
                -t_BUY_AAPL_1.transactionFees -
                t_BUY_AAPL_2.transactionFees -
                t_SELL_AAPL_1.transactionFees +
                t_SELL_AAPL_1.returnValue,
              profit: roundNDigits(
                // market value
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
                  testHistoricalPriceSymbol_AAPL.data[6].close -
                  // break even value
                  roundNDigits(
                    // break even price
                    ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
                      (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
                      (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units),
                  ) +
                  // accumulated return
                  (-t_BUY_AAPL_1.transactionFees -
                    t_BUY_AAPL_2.transactionFees -
                    t_SELL_AAPL_1.transactionFees +
                    t_SELL_AAPL_1.returnValue),
              ),
            },
          ],
          displaySymbol: testHistoricalPriceSymbol_AAPL.symbol,
          symbol: testHistoricalPriceSymbol_AAPL.symbol,
        },
        {
          data: [
            {
              date: TestTransactionDates['2023-09-07'],
              investedTotal: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotal: testHistoricalPriceSymbol_MSFT.data[0].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              investedTotal: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotal: testHistoricalPriceSymbol_MSFT.data[1].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              investedTotal: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotal: testHistoricalPriceSymbol_MSFT.data[2].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              investedTotal: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotal: testHistoricalPriceSymbol_MSFT.data[3].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
          ],
          symbol: testHistoricalPriceSymbol_MSFT.symbol,
          displaySymbol: testHistoricalPriceSymbol_MSFT.symbol,
        },
      ] satisfies PortfolioGrowthAssets[];

      const result = getPortfolioGrowthAssets([t_BUY_AAPL_1, t_BUY_AAPL_2, t_SELL_AAPL_1, t_BUY_MSFT_1], {
        [t_BUY_AAPL_1.symbol]: testHistoricalPriceSymbol_AAPL.data,
        [t_BUY_MSFT_1.symbol]: testHistoricalPriceSymbol_MSFT.data,
      });

      expect(result).toEqual(expectedResult);
    });

    it('should ignore symbol which was bought and sold totally on the same day', () => {
      const trans1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-05'],
        transactionType: 'BUY',
        unitPrice: 100,
      });
      const trans2 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 5,
        date: TestTransactionDates['2023-09-05'],
        transactionType: 'BUY',
        unitPrice: 100,
      });
      const trans3 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 15,
        date: TestTransactionDates['2023-09-05'],
        transactionType: 'SELL',
        unitPrice: 100,
      });

      const expectedResult = {
        symbol: 'AAPL',
        displaySymbol: 'AAPL',
        data: [
          {
            date: TestTransactionDates['2023-09-05'],
            investedTotal: 0,
            marketTotal: 0,
            units: 0,
            accumulatedReturn: 0,
            profit: 0,
          },
        ],
      } satisfies PortfolioGrowthAssets;

      const result = getPortfolioGrowthAssets([trans1, trans2, trans3], {
        [testHistoricalPriceSymbol_AAPL.symbol]: testHistoricalPriceSymbol_AAPL.data,
      });

      expect(result).toEqual([expectedResult]);
    });

    it('should NOT ignore symbol which was bought and sold totally on the same day and bought again', () => {
      const trans1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-05'],
        transactionType: 'BUY',
        unitPrice: 100,
      });
      const trans2 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-05'],
        transactionType: 'SELL',
        unitPrice: 90,
      });
      const trans3 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 5,
        date: TestTransactionDates['2023-09-11'],
        transactionType: 'BUY',
        unitPrice: 80,
      });

      const expectedResult = {
        data: [
          {
            date: TestTransactionDates['2023-09-05'],
            investedTotal: 0,
            marketTotal: 0,
            units: 0,
            accumulatedReturn: 0,
            profit: 0,
          },
          {
            date: TestTransactionDates['2023-09-11'],
            investedTotal: trans3.unitPrice * trans3.units,
            marketTotal: trans3.units * testHistoricalPriceSymbol_AAPL.data[5].close,
            units: trans3.units,
            accumulatedReturn: 0,
            profit: trans3.units * testHistoricalPriceSymbol_AAPL.data[5].close - trans3.units * trans3.unitPrice,
          },
          {
            date: TestTransactionDates['2023-09-12'],
            investedTotal: trans3.unitPrice * trans3.units,
            marketTotal: trans3.units * testHistoricalPriceSymbol_AAPL.data[6].close,
            units: trans3.units,
            accumulatedReturn: 0,
            profit: trans3.units * testHistoricalPriceSymbol_AAPL.data[6].close - trans3.units * trans3.unitPrice,
          },
        ],
        symbol: 'AAPL',
        displaySymbol: 'AAPL',
      } satisfies PortfolioGrowthAssets;

      const result = getPortfolioGrowthAssets([trans1, trans2, trans3], {
        [testHistoricalPriceSymbol_AAPL.symbol]: testHistoricalPriceSymbol_AAPL.data,
      });

      expect(result).toEqual([expectedResult]);
    });
  });

  describe('test: getPortfolioStateHoldingBaseByTransactionsUtil()', () => {
    const t1 = mockPortfolioTransaction({
      symbol: 'AAPL',
      date: TestTransactionDates['2023-09-04'],
      units: 10,
      unitPrice: 100,
      transactionFees: 3.25,
      transactionType: 'BUY',
    });
    const t5 = mockPortfolioTransaction({
      symbol: 'AAPL',
      date: TestTransactionDates['2023-09-04'],
      units: 10,
      unitPrice: 120,
      transactionFees: 3.25,
      transactionType: 'BUY',
    });

    const t2 = mockPortfolioTransaction({
      symbol: 'AAPL',
      date: TestTransactionDates['2023-09-06'],
      units: 3,
      unitPrice: 80,
      transactionFees: 0.25,
      transactionType: 'SELL',
      returnValue: -240,
    });

    const t3 = mockPortfolioTransaction({
      symbol: 'AAPL',
      date: TestTransactionDates['2023-09-07'],
      units: 2,
      unitPrice: 75,
      transactionFees: 0.25,
      transactionType: 'SELL',
      returnValue: -150,
    });

    const t4 = mockPortfolioTransaction({
      symbol: 'MSFT',
      date: TestTransactionDates['2023-09-06'],
      units: 10,
      unitPrice: 100,
      transactionFees: 3.25,
      transactionType: 'BUY',
    });

    it('should return holdings without any open order', () => {
      const result = getPortfolioStateHoldingBaseByTransactionsUtil([t1, t5, t2, t3, t4]);

      expect(result).toEqual([
        {
          symbolType: 'STOCK',
          symbol: 'AAPL',
          sector: 'Technology',
          units: 15,
          invested: 1810,
          breakEvenPrice: 110,
        },
        {
          symbolType: 'STOCK',
          symbol: 'MSFT',
          sector: 'Technology',
          units: 10,
          invested: 1000,
          breakEvenPrice: 100,
        },
      ]);
    });

    it('should return holdings with some open order', () => {
      const openOrders = [
        {
          symbol: 'AAPL',
          units: 5,
          orderType: {
            type: 'SELL',
          },
        },
        {
          symbol: 'MSFT',
          units: 2,
          orderType: {
            type: 'SELL',
          },
        },
        {
          symbol: 'MSFT',
          units: 10,
          orderType: {
            type: 'BUY',
          },
        },
      ] as OutstandingOrder[];
      const result = getPortfolioStateHoldingBaseByTransactionsUtil([t1, t5, t2, t3, t4], openOrders);

      expect(result).toEqual([
        {
          symbolType: 'STOCK',
          symbol: 'AAPL',
          sector: 'Technology',
          units: 10,
          invested: 1810,
          breakEvenPrice: 110,
        },
        {
          symbolType: 'STOCK',
          symbol: 'MSFT',
          sector: 'Technology',
          units: 8,
          invested: 1000,
          breakEvenPrice: 100,
        },
      ]);
    });
  });

  describe('test: recalculatePortfolioStateByTransactions()', () => {
    it('should return values for empty portfolio', () => {
      const portfolio = createEmptyPortfolioState();
      const newTransaction = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        sector: 'Technology',
        symbolType: 'STOCK',
        transactionFees: 3.25,
        transactionType: 'BUY',
        unitPrice: 100,
      });

      // get result
      const result = recalculatePortfolioStateByTransactions(portfolio, newTransaction, []);

      // calculated results
      const resultCashOnHand = roundNDigits(
        portfolio.startingCash - newTransaction.units * newTransaction.unitPrice - newTransaction.transactionFees,
      );
      const resultHoldingsBalance = roundNDigits(newTransaction.units * newTransaction.unitPrice);

      // check portfolio state
      expect(result).toEqual({
        ...portfolio,
        cashOnHand: resultCashOnHand,
        holdingsBalance: resultHoldingsBalance,
        invested: resultHoldingsBalance,
        balance: roundNDigits(resultCashOnHand + resultHoldingsBalance),
        numberOfExecutedBuyTransactions: 1,
        transactionFees: newTransaction.transactionFees,
        totalGainsValue: roundNDigits(resultCashOnHand + resultHoldingsBalance), // subtracted fees
      } satisfies PortfolioState);
    });

    it('should update holding and portfolio for multiple transactions', () => {
      const portfolio = createEmptyPortfolioState(10_000);
      const buyT1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        symbolType: 'STOCK',
        transactionFees: 3.25,
        transactionType: 'BUY',
        unitPrice: 100,
      });
      const sellT1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 5,
        symbolType: 'STOCK',
        transactionFees: 3.25,
        transactionType: 'SELL',
        unitPrice: 50,
      });
      const buyT2 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        symbolType: 'STOCK',
        transactionFees: 3.25,
        transactionType: 'BUY',
        unitPrice: 120,
      });

      // create multiple results
      const tmpRes1 = recalculatePortfolioStateByTransactions(portfolio, buyT1, []);

      // verify first transaction
      const tmpRes1Total = buyT1.units * buyT1.unitPrice;
      const tmpRes1CashOnHand = roundNDigits(portfolio.startingCash - tmpRes1Total - buyT1.transactionFees);
      expect(tmpRes1).toEqual({
        ...portfolio,
        cashOnHand: tmpRes1CashOnHand,
        holdingsBalance: roundNDigits(tmpRes1Total),
        invested: roundNDigits(tmpRes1Total),
        balance: roundNDigits(tmpRes1CashOnHand + tmpRes1Total),
        numberOfExecutedBuyTransactions: 1,
        transactionFees: buyT1.transactionFees,
        totalGainsValue: roundNDigits(tmpRes1CashOnHand + tmpRes1Total - portfolio.startingCash),
        totalGainsPercentage: calculateGrowth(tmpRes1CashOnHand + tmpRes1Total, portfolio.startingCash),
      } satisfies PortfolioState);

      const tmpRes2 = recalculatePortfolioStateByTransactions(tmpRes1, sellT1, [buyT1]);

      // verify second transaction
      const tmpRes2Total = buyT1.units * buyT1.unitPrice - sellT1.units * sellT1.unitPrice;
      const tmpRes2CashOnHand = roundNDigits(
        portfolio.startingCash - tmpRes2Total - buyT1.transactionFees - sellT1.transactionFees,
      );
      expect(tmpRes2).toEqual({
        ...portfolio,
        cashOnHand: tmpRes2CashOnHand,
        holdingsBalance: roundNDigits(tmpRes2Total),
        invested: roundNDigits(tmpRes2Total),
        balance: roundNDigits(tmpRes2CashOnHand + tmpRes2Total),
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 1,
        transactionFees: buyT1.transactionFees + sellT1.transactionFees,
        totalGainsValue: roundNDigits(tmpRes2CashOnHand + tmpRes2Total - portfolio.startingCash),
        totalGainsPercentage: calculateGrowth(tmpRes2CashOnHand + tmpRes2Total, portfolio.startingCash),
      } satisfies PortfolioState);

      const result = recalculatePortfolioStateByTransactions(tmpRes2, buyT2, [buyT1, sellT1]);

      // calculated results
      const expectedCashOnHand = roundNDigits(
        portfolio.startingCash -
          buyT1.units * buyT1.unitPrice -
          buyT1.transactionFees +
          sellT1.units * sellT1.unitPrice -
          sellT1.transactionFees -
          buyT2.units * buyT2.unitPrice -
          buyT2.transactionFees,
      );
      const expectedHoldingsBalance = roundNDigits(
        buyT1.units * buyT1.unitPrice - sellT1.units * sellT1.unitPrice + buyT2.units * buyT2.unitPrice,
      );
      const expectedBalance = roundNDigits(expectedCashOnHand + expectedHoldingsBalance);

      // check portfolio state
      expect(result).toEqual({
        ...portfolio,
        cashOnHand: expectedCashOnHand,
        holdingsBalance: expectedHoldingsBalance,
        invested: expectedHoldingsBalance,
        balance: expectedBalance,
        numberOfExecutedBuyTransactions: 2,
        numberOfExecutedSellTransactions: 1,
        transactionFees: buyT1.transactionFees + sellT1.transactionFees + buyT2.transactionFees,
        totalGainsValue: roundNDigits(expectedBalance - portfolio.startingCash),
        totalGainsPercentage: calculateGrowth(expectedBalance, portfolio.startingCash),
      } satisfies PortfolioState);
    });

    it('should reduce cash on hand by open orders', () => {
      const portfolio = {
        ...createEmptyPortfolioState(10_000),
      } satisfies PortfolioState;
      const openOrders = [
        {
          displaySymbol: 'MSFT',
          symbol: 'MSFT',
          potentialTotalPrice: 2000,
          orderType: {
            type: 'BUY',
          },
        },
      ] as OutstandingOrder[];
      const newTransaction = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 0,
        sector: 'Technology',
        symbolType: 'STOCK',
        transactionFees: 0,
        transactionType: 'BUY',
        unitPrice: 0,
        returnValue: 0,
      });

      // get result
      const result = recalculatePortfolioStateByTransactions(portfolio, newTransaction, [], openOrders);

      // calculated results
      const resultCashOnHand = roundNDigits(portfolio.startingCash - openOrders[0].potentialTotalPrice);
      const resultBalance = resultCashOnHand + openOrders[0].potentialTotalPrice;

      // check portfolio state
      expect(result).toEqual({
        ...portfolio,
        cashOnHand: resultCashOnHand,
        holdingsBalance: 0,
        invested: portfolio.invested,
        balance: roundNDigits(resultBalance),
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 0,
        totalGainsValue: roundNDigits(resultBalance - portfolio.startingCash),
        totalGainsPercentage: calculateGrowth(resultBalance, portfolio.startingCash),
        transactionFees: newTransaction.transactionFees,
        transactionProfit: newTransaction.returnValue,
      } satisfies PortfolioState);
    });
  });

  describe('Test: getPortfolioGrowth', () => {
    it('should calculate growth with starting cash on hand', async () => {
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

      const portfolioGrowth = getPortfolioGrowth(portfolioGrowthAssets, USER_DEFAULT_STARTING_CASH);

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
      const portfolioGrowth = getPortfolioGrowth(portfolioGrowthAssets, 0);

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
