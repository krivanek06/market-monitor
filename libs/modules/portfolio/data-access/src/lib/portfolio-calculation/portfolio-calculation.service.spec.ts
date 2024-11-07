import { TestBed } from '@angular/core/testing';

import { MarketApiService } from '@mm/api-client';
import {
  PortfolioGrowthAssets,
  PortfolioState,
  PortfolioStateHoldings,
  TestTransactionDates,
  mockPortfolioTransaction,
  mockSymbolSummaryAAPL,
  mockSymbolSummaryMSFT,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
} from '@mm/api-types';
import {
  calculateGrowth,
  createEmptyPortfolioState,
  getCurrentDateDetailsFormat,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  roundNDigits,
} from '@mm/shared/general-util';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
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

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: getPortfolioStateHoldings', () => {
    it('should be defined', () => {
      expect(service.getPortfolioStateHoldings).toBeDefined();
    });

    it('should call getSymbolQuotes', () => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolQuotes: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      const emptyPortfolio = createEmptyPortfolioState();
      service.getPortfolioStateHoldings(emptyPortfolio, []).subscribe();

      expect(marketApiService.getSymbolQuotes).toHaveBeenCalled();
    });

    it('should return empty holding for no transactions', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolQuotes: jest.fn().mockReturnValue(of([])),
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
        transactionProfit: 0,
        holdings: [],
        date: getCurrentDateDetailsFormat(),
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(expectedResult, expectedResult.holdings).subscribe({
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
        getSymbolQuotes: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL.quote])),
      });

      const t1 = mockPortfolioTransaction({
        symbol: 'AAPL',
        units: 10,
        date: TestTransactionDates['2023-09-04'],
        transactionType: 'BUY',
        unitPrice: 100,
      });

      const emptyPortfolio = {
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
        transactionProfit: 0,
      } satisfies PortfolioState;
      const holdings = getPortfolioStateHoldingBaseByTransactionsUtil([t1]);

      // expected result
      const expectedResult = {
        ...emptyPortfolio,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: t1.units,
            invested: t1.units * t1.unitPrice,
            breakEvenPrice: t1.unitPrice,
            weight: 1,
            sector: 'Technology',
            symbolQuote: mockSymbolSummaryAAPL.quote,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(emptyPortfolio, holdings).subscribe({
        next: (res) => {
          expect(res.holdings).toEqual(expectedResult.holdings);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction with starting cash', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolQuotes: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL.quote])),
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

      const emptyPortfolio = {
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
        transactionProfit: 0,
      } satisfies PortfolioState;
      const holdings = getPortfolioStateHoldingBaseByTransactionsUtil([testTransaction_BUY_AAPL_1_Change]);

      // expected result
      const expectedResult = {
        ...emptyPortfolio,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: testTransaction_BUY_AAPL_1_Change.units,
            invested: testTransaction_BUY_AAPL_1_Change.units * testTransaction_BUY_AAPL_1_Change.unitPrice,
            breakEvenPrice: testTransaction_BUY_AAPL_1_Change.unitPrice,
            weight: 1,
            sector: 'Technology',
            symbolQuote: mockSymbolSummaryAAPL.quote,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(emptyPortfolio, holdings).subscribe({
        next: (res) => {
          console.log(res);
          expect(res.holdings).toEqual(expectedResult.holdings);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction and non-empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = ngMocks.findInstance(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolQuotes: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL.quote, mockSymbolSummaryMSFT.quote])),
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
        returnValue: 300, // random number
        returnChange: 9.22, // random number
      });

      const t_BUY_MSFT_1_Change = mockPortfolioTransaction({
        symbol: 'MSFT',
        units: 10,
        date: TestTransactionDates['2023-09-07'],
        transactionType: 'BUY',
        unitPrice: 85.5,
        transactionFees: 0.1,
      });

      const totalReturn = t_Sell_AAPL.returnValue;

      const aaplUnits = t_BUY_AAPL_1_Change.units - t_Sell_AAPL.units;
      const aaplInvested = aaplUnits * t_BUY_AAPL_1_Change.unitPrice;

      const msftInvested = t_BUY_MSFT_1_Change.units * t_BUY_MSFT_1_Change.unitPrice;
      const totalInvested = aaplInvested + msftInvested;

      const totalHoldings =
        aaplUnits * mockSymbolSummaryAAPL.quote.price + t_BUY_MSFT_1_Change.units * mockSymbolSummaryMSFT.quote.price;

      const totalTransactionFees =
        t_BUY_AAPL_1_Change.transactionFees + t_Sell_AAPL.transactionFees + t_BUY_MSFT_1_Change.transactionFees;

      const profit = t_BUY_AAPL_1_Change.returnValue + t_Sell_AAPL.returnValue + t_BUY_MSFT_1_Change.returnValue;

      const cashOnHandTransactions = startingCash - totalInvested - totalTransactionFees + profit;
      const currentBalance = cashOnHandTransactions + totalHoldings;

      const previousBalanceChange =
        aaplUnits * mockSymbolSummaryAAPL.quote.change + t_BUY_MSFT_1_Change.units * mockSymbolSummaryMSFT.quote.change;

      const startingPortfolio = {
        balance: currentBalance,
        cashOnHand: cashOnHandTransactions,
        date: getCurrentDateDetailsFormat(),
        firstTransactionDate: TestTransactionDates['2023-09-04'],
        startingCash: startingCash,
        holdingsBalance: totalHoldings,
        invested: totalInvested,
        lastTransactionDate: TestTransactionDates['2023-09-07'],
        numberOfExecutedBuyTransactions: 2,
        numberOfExecutedSellTransactions: 1,
        previousBalanceChange: previousBalanceChange,
        previousBalanceChangePercentage: calculateGrowth(currentBalance, currentBalance - previousBalanceChange),
        totalGainsPercentage: calculateGrowth(currentBalance, startingCash),
        totalGainsValue: totalHoldings - aaplInvested - msftInvested - totalTransactionFees + totalReturn,
        transactionFees: totalTransactionFees,
        transactionProfit: profit,
      } satisfies PortfolioState;

      // expected result
      const expectedResult = {
        ...startingPortfolio,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: t_BUY_AAPL_1_Change.symbol,
            units: aaplUnits,
            invested: aaplInvested,
            breakEvenPrice: roundNDigits(aaplInvested / aaplUnits),
            weight: roundNDigits(aaplInvested / totalInvested, 6),
            sector: 'Technology',
            symbolQuote: mockSymbolSummaryAAPL.quote,
          },
          {
            symbolType: 'STOCK',
            symbol: t_BUY_MSFT_1_Change.symbol,
            units: t_BUY_MSFT_1_Change.units,
            invested: msftInvested,
            breakEvenPrice: roundNDigits(msftInvested / t_BUY_MSFT_1_Change.units),
            weight: roundNDigits(msftInvested / totalInvested, 6),
            sector: 'Technology',
            symbolQuote: mockSymbolSummaryMSFT.quote,
          },
        ],
      } satisfies PortfolioStateHoldings;

      // TODO - check if this is OK
      const holdings = getPortfolioStateHoldingBaseByTransactionsUtil([
        t_BUY_AAPL_1_Change,
        t_BUY_MSFT_1_Change,
        t_Sell_AAPL,
      ]);

      service.getPortfolioStateHoldings(startingPortfolio, holdings).subscribe({
        next: (res) => {
          try {
            expect(res.holdings).toEqual(expectedResult.holdings);
            done();
          } catch (e) {
            console.error('e', e);
          }
        },
        error: (e) => {
          console.error('e', e);
          done.fail();
        },
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
        displaySymbol: t1.symbol,
        data: testHistoricalPriceSymbol_AAPL.data.map((d) => ({
          date: d.date,
          investedTotal: t1.units * t1.unitPrice,
          units: t1.units,
          marketTotal: t1.units * d.close,
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
          console.error('e', e);
          done.fail();
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

      service
        .getPortfolioGrowthAssets([t1])
        .then((data) => {
          expect(data).toEqual([expectedResult]);
          expect(marketApiService.getHistoricalPricesDateRange).toHaveBeenCalled();
          done();
        })
        .catch((e) => {
          console.error('e', e);
          done.fail();
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

      service
        .getPortfolioGrowthAssets([t_BUY_AAPL_1, t_BUY_AAPL_2, t_SELL_AAPL_1, t_BUY_MSFT_1])
        .then((data) => {
          expect(data).toEqual(expectedResult);
          done();
        })
        .catch((e) => {
          console.error('e', e);
          done.fail();
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
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data.slice(1))),
      });

      // service
      service
        .getPortfolioGrowthAssets([trans1, trans2, trans3])
        .then((data) => {
          expect(data[0]).toEqual({
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
          } satisfies PortfolioGrowthAssets);
          done();
        })
        .catch((e) => {
          console.error('e', e);
          done.fail();
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
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data.slice(1))),
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

      // service
      service
        .getPortfolioGrowthAssets([trans1, trans2, trans3])
        .then((data) => {
          console.log('aaa', data);
          expect(data.length).toEqual(1);
          expect(data[0].symbol).toEqual(expectedResult.symbol);
          expect(data[0].data.length).toEqual(expectedResult.data.length);
          expect(data[0].data).toEqual(expectedResult.data);
          expect(data).toEqual([expectedResult]);
          done();
        })
        .catch((e) => {
          console.error('e', e);
          done.fail();
        });
    });
  });
});
