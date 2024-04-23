import { TestBed } from '@angular/core/testing';

import { MarketApiService } from '@mm/api-client';
import { PortfolioGrowthAssets, PortfolioStateHoldings, USER_DEFAULT_STARTING_CASH } from '@mm/api-types';
import { calculateGrowth, getCurrentDateDetailsFormat, roundNDigits } from '@mm/shared/general-util';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import {
  PortfolioGrowth,
  TestTransactionDates,
  mockPortfolioTransaction,
  mockSymbolSummaryAAPL,
  mockSymbolSummaryMSFT,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
} from '../models';
import { PortfolioCalculationService } from './portfolio-calculation.service';

describe('PortfolioCalculationService', () => {
  let service: PortfolioCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(MarketApiService)],
    });
    service = ngMocks.findInstance(PortfolioCalculationService);
  });

  beforeAll(() => {
    // freezing time
    jest.useFakeTimers().setSystemTime(new Date(getCurrentDateDetailsFormat()));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: getPortfolioStateHoldings', () => {
    it('should be defined', () => {
      expect(service.getPortfolioStateHoldings).toBeDefined();
    });

    it('should call getSymbolSummaries', () => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      service.getPortfolioStateHoldings(0, []).subscribe();

      expect(marketApiService.getSymbolSummaries).toHaveBeenCalled();
    });

    it('should return empty holding for no transactions', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([])),
      });

      const expectedResult = {
        balance: 0,
        cashOnHand: 0,
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
        holdings: [],
        date: getCurrentDateDetailsFormat(),
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(0, []).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction without starting cash', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      const t1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      // expected result
      const expectedResult = {
        balance: t1.units * mockSymbolSummaryAAPL.quote.price,
        invested: t1.units * t1.unitPrice,
        cashOnHand: 0,
        date: getCurrentDateDetailsFormat(),
        firstTransactionDate: t1.date,
        lastTransactionDate: t1.date,
        holdingsBalance: t1.units * mockSymbolSummaryAAPL.quote.price,
        previousBalanceChange: mockSymbolSummaryAAPL.quote.change * t1.units,
        previousBalanceChangePercentage: calculateGrowth(
          t1.units * mockSymbolSummaryAAPL.quote.price,
          t1.units * mockSymbolSummaryAAPL.quote.price - mockSymbolSummaryAAPL.quote.change * t1.units,
        ),
        totalGainsPercentage: calculateGrowth(t1.units * mockSymbolSummaryAAPL.quote.price, t1.units * t1.unitPrice),
        totalGainsValue: (mockSymbolSummaryAAPL.quote.price - t1.unitPrice) * t1.units,
        transactionFees: 0,
        startingCash: 0,
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 0,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: t1.units,
            invested: t1.units * t1.unitPrice,
            breakEvenPrice: t1.unitPrice,
            weight: 1,
            symbolSummary: mockSymbolSummaryAAPL,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(0, [t1]).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction with starting cash', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      const startingCash = 8000;

      const testTransaction_BUY_AAPL_1_Change = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        transactionFees: 0.25,
        unitPrice: 100,
      });

      const invested = testTransaction_BUY_AAPL_1_Change.units * testTransaction_BUY_AAPL_1_Change.unitPrice;
      const holdingValue = testTransaction_BUY_AAPL_1_Change.units * mockSymbolSummaryAAPL.quote.price;
      const currentBalance = startingCash - invested + holdingValue - testTransaction_BUY_AAPL_1_Change.transactionFees;

      // expected result
      const expectedResult = {
        balance: currentBalance,
        invested: invested,
        cashOnHand: startingCash - invested - testTransaction_BUY_AAPL_1_Change.transactionFees,
        date: getCurrentDateDetailsFormat(),
        firstTransactionDate: testTransaction_BUY_AAPL_1_Change.date,
        lastTransactionDate: testTransaction_BUY_AAPL_1_Change.date,
        holdingsBalance: holdingValue,
        previousBalanceChange: mockSymbolSummaryAAPL.quote.change * testTransaction_BUY_AAPL_1_Change.units,
        previousBalanceChangePercentage: calculateGrowth(
          currentBalance,
          currentBalance - mockSymbolSummaryAAPL.quote.change * testTransaction_BUY_AAPL_1_Change.units,
        ),
        totalGainsPercentage: calculateGrowth(currentBalance, startingCash),
        totalGainsValue:
          (mockSymbolSummaryAAPL.quote.price - testTransaction_BUY_AAPL_1_Change.unitPrice) *
            testTransaction_BUY_AAPL_1_Change.units -
          testTransaction_BUY_AAPL_1_Change.transactionFees,
        transactionFees: testTransaction_BUY_AAPL_1_Change.transactionFees,
        startingCash: startingCash,
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 0,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: testTransaction_BUY_AAPL_1_Change.units,
            invested: testTransaction_BUY_AAPL_1_Change.units * testTransaction_BUY_AAPL_1_Change.unitPrice,
            breakEvenPrice: testTransaction_BUY_AAPL_1_Change.unitPrice,
            weight: 1,
            symbolSummary: mockSymbolSummaryAAPL,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(startingCash, [testTransaction_BUY_AAPL_1_Change]).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction and non-empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL, mockSymbolSummaryMSFT])),
      });

      const startingCash = 10_000;

      const t_BUY_AAPL_1_Change = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
        transactionFees: 0.25,
      });
      const t_Sell_AAPL = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 5,
        date: TestTransactionDates['2023-09-12'],
        transactionType: 'SELL',
        unitPrice: 130,
        transactionFees: 0.5,
      });

      const t_BUY_MSFT_1_Change = mockPortfolioTransaction({
        symbol: 'MSFT',
        units: 10,
        date: TestTransactionDates['2023-09-07'],
        transactionType: 'BUY',
        unitPrice: 85.5,
        transactionFees: 0.1,
      });

      const aaplInvested =
        t_BUY_AAPL_1_Change.units * t_BUY_AAPL_1_Change.unitPrice - t_Sell_AAPL.units * t_Sell_AAPL.unitPrice;

      const aaplUnits = t_BUY_AAPL_1_Change.units - t_Sell_AAPL.units;

      const msftInvested = t_BUY_MSFT_1_Change.units * t_BUY_MSFT_1_Change.unitPrice;
      const totalInvested = aaplInvested + msftInvested;

      const totalHoldings =
        aaplUnits * mockSymbolSummaryAAPL.quote.price + t_BUY_MSFT_1_Change.units * mockSymbolSummaryMSFT.quote.price;

      const totalTransactionFees =
        t_BUY_AAPL_1_Change.transactionFees + t_Sell_AAPL.transactionFees + t_BUY_MSFT_1_Change.transactionFees;

      const currentBalance = startingCash - totalTransactionFees - aaplInvested - msftInvested + totalHoldings;
      const cashOnHandTransactions = startingCash - aaplInvested - msftInvested - totalTransactionFees;
      const previousBalanceChange =
        aaplUnits * mockSymbolSummaryAAPL.quote.change + t_BUY_MSFT_1_Change.units * mockSymbolSummaryMSFT.quote.change;

      // expected result
      const expectedResult = {
        balance: currentBalance,
        cashOnHand: cashOnHandTransactions,
        date: getCurrentDateDetailsFormat(),
        firstTransactionDate: TestTransactionDates['2023-09-04'],
        startingCash: startingCash,
        holdingsBalance: totalHoldings,
        invested: aaplInvested + msftInvested,
        lastTransactionDate: TestTransactionDates['2023-09-07'],
        numberOfExecutedBuyTransactions: 2,
        numberOfExecutedSellTransactions: 1,
        previousBalanceChange: previousBalanceChange,
        previousBalanceChangePercentage: calculateGrowth(currentBalance, currentBalance - previousBalanceChange),
        totalGainsPercentage: calculateGrowth(currentBalance, cashOnHandTransactions + aaplInvested + msftInvested),
        totalGainsValue: totalHoldings - aaplInvested - msftInvested - totalTransactionFees,
        transactionFees: totalTransactionFees,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: t_BUY_MSFT_1_Change.symbol,
            units: t_BUY_MSFT_1_Change.units,
            invested: msftInvested,
            breakEvenPrice: roundNDigits(msftInvested / t_BUY_MSFT_1_Change.units),
            weight: roundNDigits(msftInvested / totalInvested, 6),
            symbolSummary: mockSymbolSummaryMSFT,
          },
          {
            symbolType: 'STOCK',
            symbol: t_BUY_AAPL_1_Change.symbol,
            units: aaplUnits,
            invested: aaplInvested,
            breakEvenPrice: roundNDigits(aaplInvested / aaplUnits),
            weight: roundNDigits(aaplInvested / totalInvested, 6),
            symbolSummary: mockSymbolSummaryAAPL,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service
        .getPortfolioStateHoldings(startingCash, [t_BUY_AAPL_1_Change, t_Sell_AAPL, t_BUY_MSFT_1_Change])
        .subscribe({
          next: (res) => {
            expect(res).toEqual(expectedResult);
            done();
          },
          error: done.fail,
        });
    });
  });

  describe('Test: getPortfolioGrowthAssets', () => {
    it('should return empty array for no transactions', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn(),
      });

      service.getPortfolioGrowthAssets([]).then((data) => {
        expect(data).toEqual([]);
        expect(marketApiService.getHistoricalPricesDateRange).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return portfolio asset growth for one transaction without transaction fees', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

      const t1 = mockPortfolioTransaction({
        symbol: testHistoricalPriceSymbol_AAPL.symbol,
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const expectedResult = {
        symbol: t1.symbol,
        data: testHistoricalPriceSymbol_AAPL.data.map((d) => ({
          date: d.date,
          breakEvenValue: t1.units * t1.unitPrice,
          units: t1.units,
          marketTotalValue: t1.units * d.close,
          accumulatedReturn: 0,
          profit: t1.units * d.close - t1.units * t1.unitPrice,
        })),
      } satisfies PortfolioGrowthAssets;

      service
        .getPortfolioGrowthAssets([t1])
        .then((data) => {
          expect(data).toEqual([expectedResult]);
          expect(marketApiService.getHistoricalPricesDateRange).toHaveBeenCalled();
          done();
        })
        .catch((e) => {
          console.log('e', e);
          done.fail;
        });
    });

    it('should return portfolio asset growth for one transaction with transaction fees', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

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
        data: testHistoricalPriceSymbol_AAPL.data.map((d) => ({
          date: d.date,
          breakEvenValue: t1.units * t1.unitPrice,
          units: t1.units,
          marketTotalValue: t1.units * d.close,
          accumulatedReturn: -t1.transactionFees,
          profit: t1.units * d.close - t1.units * t1.unitPrice - t1.transactionFees,
        })),
      } satisfies PortfolioGrowthAssets;

      service
        .getPortfolioGrowthAssets([t1])
        .then((data) => {
          expect(data).toEqual([expectedResult]);
          expect(marketApiService.getHistoricalPricesDateRange).toHaveBeenCalled();
          done();
        })
        .catch((e) => {
          console.log('e', e);
          done.fail;
        });
    });

    it('should return portfolio asset growth for multiple transaction', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest
          .fn()
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_AAPL.data))
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_MSFT.data)),
      });

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
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-05'],
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-06'],
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-07'],
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice,
              marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close,
              units: t_BUY_AAPL_1.units,
              accumulatedReturn: -t_BUY_AAPL_1.transactionFees,
              profit:
                t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
                t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice -
                t_BUY_AAPL_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              breakEvenValue: t_BUY_AAPL_1.units * t_BUY_AAPL_1.unitPrice + t_BUY_AAPL_2.units * t_BUY_AAPL_2.unitPrice,
              marketTotalValue:
                (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close,
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
              breakEvenValue: roundNDigits(
                // break even price
                ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
                  (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units),
              ),
              marketTotalValue:
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
          symbol: 'AAPL',
        },
        {
          data: [
            {
              date: TestTransactionDates['2023-09-07'],
              breakEvenValue: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[0].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              breakEvenValue: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[1].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              breakEvenValue: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[2].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              breakEvenValue: t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[3].close * t_BUY_MSFT_1.units,
              units: t_BUY_MSFT_1.units,
              accumulatedReturn: -t_BUY_MSFT_1.transactionFees,
              profit:
                t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close -
                t_BUY_MSFT_1.units * t_BUY_MSFT_1.unitPrice -
                t_BUY_MSFT_1.transactionFees,
            },
          ],
          symbol: 'MSFT',
        },
      ] satisfies PortfolioGrowthAssets[];

      service
        .getPortfolioGrowthAssets([t_BUY_AAPL_1, t_BUY_AAPL_2, t_SELL_AAPL_1, t_BUY_MSFT_1])
        .then((data) => {
          expect(data).toEqual(expectedResult);
          done();
        })
        .catch((e) => {
          console.log('e', e);
          done.fail;
        });
    });

    it('should ignore symbol which was bought and sold totally on the same day', (done) => {
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

      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

      // service
      service
        .getPortfolioGrowthAssets([trans1, trans2, trans3])
        .then((data) => {
          expect(data).toEqual([]);
          done();
        })
        .catch((e) => {
          console.log('e', e);
          done.fail;
        });
    });

    it('should NOT ignore symbol which was bought and sold totally on the same day and bought again', (done) => {
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

      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

      const expectedResult = [
        {
          data: [
            {
              date: TestTransactionDates['2023-09-11'],
              breakEvenValue: trans3.unitPrice * trans3.units,
              marketTotalValue: trans3.units * testHistoricalPriceSymbol_AAPL.data[5].close,
              units: trans3.units,
              accumulatedReturn: 0,
              profit: trans3.units * testHistoricalPriceSymbol_AAPL.data[5].close - trans3.units * trans3.unitPrice,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              breakEvenValue: trans3.unitPrice * trans3.units,
              marketTotalValue: trans3.units * testHistoricalPriceSymbol_AAPL.data[6].close,
              units: trans3.units,
              accumulatedReturn: 0,
              profit: trans3.units * testHistoricalPriceSymbol_AAPL.data[6].close - trans3.units * trans3.unitPrice,
            },
          ],
          symbol: 'AAPL',
        },
      ] satisfies PortfolioGrowthAssets[];

      // service
      service
        .getPortfolioGrowthAssets([trans1, trans2, trans3])
        .then((data) => {
          expect(data).toEqual(expectedResult);
          done();
        })
        .catch((e) => {
          console.log('e', e);
          done.fail;
        });
    });
  });

  describe('Test: getPortfolioGrowth', () => {
    it('should calculate growth with starting cash on hand', async () => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest
          .fn()
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_AAPL.data))
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_MSFT.data)),
        getIsMarketOpenSignal: jest.fn().mockReturnValue(undefined) as any,
      });

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

      const portfolioGrowthAssets = await service.getPortfolioGrowthAssets([
        t_BUY_AAPL_1,
        t_BUY_AAPL_2,
        t_SELL_AAPL_1,
        t_BUY_MSFT_1,
      ]);

      const portfolioGrowth = service.getPortfolioGrowth(portfolioGrowthAssets, USER_DEFAULT_STARTING_CASH);

      const expectedResult = [
        {
          date: TestTransactionDates['2023-09-04'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-05'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-06'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-07'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            (t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-08'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            (t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-11'],
          breakEvenValue:
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close,
          totalBalanceValue:
            USER_DEFAULT_STARTING_CASH +
            ((t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close -
              t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units -
              t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-12'],
          breakEvenValue: roundNDigits(
            // break even price
            ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) +
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          ),
          marketTotalValue:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
              testHistoricalPriceSymbol_AAPL.data[6].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close,
          totalBalanceValue: roundNDigits(
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

    it('should calculate growth without starting cash on hand', async () => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest
          .fn()
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_AAPL.data))
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_MSFT.data)),
        getIsMarketOpenSignal: jest.fn().mockReturnValue(undefined) as any,
      });

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

      const portfolioGrowthAssets = await service.getPortfolioGrowthAssets([
        t_BUY_AAPL_1,
        t_BUY_AAPL_2,
        t_SELL_AAPL_1,
        t_BUY_MSFT_1,
      ]);

      const portfolioGrowth = service.getPortfolioGrowth(portfolioGrowthAssets);

      const expectedResult = [
        {
          date: TestTransactionDates['2023-09-04'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
          totalBalanceValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-05'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
          totalBalanceValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-06'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
          marketTotalValue: t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
          totalBalanceValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units,
        },
        {
          date: TestTransactionDates['2023-09-07'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close,
          totalBalanceValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[0].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-08'],
          breakEvenValue: t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close,
          totalBalanceValue:
            t_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[1].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-11'],
          breakEvenValue:
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units +
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          marketTotalValue:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close,
          totalBalanceValue:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units) * testHistoricalPriceSymbol_AAPL.data[5].close -
            t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units -
            t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units +
            (t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[2].close -
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units),
        },
        {
          date: TestTransactionDates['2023-09-12'],
          breakEvenValue: roundNDigits(
            // break even price
            ((t_BUY_AAPL_1.unitPrice * t_BUY_AAPL_1.units + t_BUY_AAPL_2.unitPrice * t_BUY_AAPL_2.units) /
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units)) *
              (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) +
              t_BUY_MSFT_1.unitPrice * t_BUY_MSFT_1.units,
          ),
          marketTotalValue:
            (t_BUY_AAPL_1.units + t_BUY_AAPL_2.units - t_SELL_AAPL_1.units) *
              testHistoricalPriceSymbol_AAPL.data[6].close +
            t_BUY_MSFT_1.units * testHistoricalPriceSymbol_MSFT.data[3].close,
          totalBalanceValue: roundNDigits(
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
