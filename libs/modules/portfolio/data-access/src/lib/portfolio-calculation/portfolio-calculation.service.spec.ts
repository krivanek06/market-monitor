import { TestBed } from '@angular/core/testing';

import { MarketApiService } from '@mm/api-client';
import { PortfolioGrowthAssets, PortfolioStateHoldingBase, PortfolioStateHoldings } from '@mm/api-types';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import {
  TestTransactionDates,
  mockPortfolioTransaction,
  mockSymbolSummaryAAPL,
  testHistoricalPriceSymbol_AAPL,
  testHistoricalPriceSymbol_MSFT,
  testPreviousTransactionEmpty,
  testPreviousTransactionNonEmpty,
  testTransaction_BUY_AAPL_1,
  testTransaction_BUY_AAPL_2,
  testTransaction_BUY_MSFT_1,
  testTransaction_SELL_AAPL_1,
} from '../models';
import { PortfolioCalculationService } from './portfolio-calculation.service';

describe('PortfolioCalculationService', () => {
  let service: PortfolioCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(MarketApiService)],
    });
    service = TestBed.inject(PortfolioCalculationService);
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
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      service.getPortfolioStateHoldings(testPreviousTransactionEmpty, []).subscribe();

      expect(marketApiService.getSymbolSummaries).toHaveBeenCalled();
    });

    it('should return empty holding for no transactions', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([])),
      });

      const expectedResult = {
        ...testPreviousTransactionEmpty,
        holdings: [],
      } satisfies PortfolioStateHoldings;

      service.getPortfolioStateHoldings(testPreviousTransactionEmpty, []).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction and empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      // expected result
      const expectedResult = {
        ...testPreviousTransactionEmpty,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: testTransaction_BUY_AAPL_1.units,
            invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
            breakEvenPrice: testTransaction_BUY_AAPL_1.unitPrice,
            weight: 1,
            symbolSummary: mockSymbolSummaryAAPL,
          },
        ],
      } satisfies PortfolioStateHoldings;

      const holdings: PortfolioStateHoldingBase = {
        symbol: 'AAPL',
        invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
        units: testTransaction_BUY_AAPL_1.units,
        symbolType: 'STOCK',
      };

      service.getPortfolioStateHoldings(testPreviousTransactionEmpty, [holdings]).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for one transaction and non-empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      // expected result
      const expectedResult = {
        ...testPreviousTransactionNonEmpty,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: 'AAPL',
            units: testTransaction_BUY_AAPL_1.units,
            invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
            breakEvenPrice: testTransaction_BUY_AAPL_1.unitPrice,
            weight: 1,
            symbolSummary: mockSymbolSummaryAAPL,
          },
        ],
      } satisfies PortfolioStateHoldings;

      const holdings: PortfolioStateHoldingBase = {
        symbol: 'AAPL',
        invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
        units: testTransaction_BUY_AAPL_1.units,
        symbolType: 'STOCK',
      };

      service.getPortfolioStateHoldings(testPreviousTransactionNonEmpty, [holdings]).subscribe({
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
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn(),
      });

      service.getPortfolioGrowthAssets([]).then((data) => {
        expect(data).toEqual([]);
        expect(marketApiService.getHistoricalPricesDateRange).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return portfolio asset growth for one transaction', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

      const expectedResult = {
        symbol: testTransaction_BUY_AAPL_1.symbol,
        data: testHistoricalPriceSymbol_AAPL.data.map((d) => ({
          date: d.date,
          investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
          units: testTransaction_BUY_AAPL_1.units,
          marketTotalValue: testTransaction_BUY_AAPL_1.units * d.close,
        })),
      } satisfies PortfolioGrowthAssets;

      service
        .getPortfolioGrowthAssets([testTransaction_BUY_AAPL_1])
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
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest
          .fn()
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_AAPL.data))
          .mockReturnValueOnce(of(testHistoricalPriceSymbol_MSFT.data)),
      });

      const expectedResult = [
        {
          data: [
            {
              date: TestTransactionDates['2023-09-04'],
              investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
              marketTotalValue: testTransaction_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[0].close,
              units: testTransaction_BUY_AAPL_1.units,
            },
            {
              date: TestTransactionDates['2023-09-05'],
              investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
              marketTotalValue: testTransaction_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[1].close,
              units: testTransaction_BUY_AAPL_1.units,
            },
            {
              date: TestTransactionDates['2023-09-06'],
              investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
              marketTotalValue: testTransaction_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[2].close,
              units: testTransaction_BUY_AAPL_1.units,
            },
            {
              date: TestTransactionDates['2023-09-07'],
              investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
              marketTotalValue: testTransaction_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[3].close,
              units: testTransaction_BUY_AAPL_1.units,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              investedValue: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
              marketTotalValue: testTransaction_BUY_AAPL_1.units * testHistoricalPriceSymbol_AAPL.data[4].close,
              units: testTransaction_BUY_AAPL_1.units,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              investedValue:
                testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice +
                testTransaction_BUY_AAPL_2.units * testTransaction_BUY_AAPL_2.unitPrice,
              marketTotalValue:
                (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units) *
                testHistoricalPriceSymbol_AAPL.data[4].close,
              units: testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              investedValue: 1066.67,
              marketTotalValue:
                (testTransaction_BUY_AAPL_1.units +
                  testTransaction_BUY_AAPL_2.units -
                  testTransaction_SELL_AAPL_1.units) *
                testHistoricalPriceSymbol_AAPL.data[4].close,
              units:
                testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units,
            },
          ],
          symbol: 'AAPL',
        },
        {
          data: [
            {
              date: TestTransactionDates['2023-09-07'],
              investedValue: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[0].close * testTransaction_BUY_MSFT_1.units,
              units: testTransaction_BUY_MSFT_1.units,
            },
            {
              date: TestTransactionDates['2023-09-08'],
              investedValue: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[1].close * testTransaction_BUY_MSFT_1.units,
              units: testTransaction_BUY_MSFT_1.units,
            },
            {
              date: TestTransactionDates['2023-09-11'],
              investedValue: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[2].close * testTransaction_BUY_MSFT_1.units,
              units: testTransaction_BUY_MSFT_1.units,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              investedValue: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
              marketTotalValue: testHistoricalPriceSymbol_MSFT.data[3].close * testTransaction_BUY_MSFT_1.units,
              units: testTransaction_BUY_MSFT_1.units,
            },
          ],
          symbol: 'MSFT',
        },
      ] satisfies PortfolioGrowthAssets[];

      service
        .getPortfolioGrowthAssets([
          testTransaction_BUY_AAPL_1,
          testTransaction_BUY_AAPL_2,
          testTransaction_SELL_AAPL_1,
          testTransaction_BUY_MSFT_1,
        ])
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
      const marketApiService = TestBed.inject(MarketApiService);
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
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getHistoricalPricesDateRange: jest.fn().mockReturnValue(of(testHistoricalPriceSymbol_AAPL.data)),
      });

      const expectedResult = [
        {
          data: [
            {
              date: TestTransactionDates['2023-09-11'],
              investedValue: 400,
              marketTotalValue: 50,
              units: 5,
            },
            {
              date: TestTransactionDates['2023-09-12'],
              investedValue: 400,
              marketTotalValue: 50,
              units: 5,
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
});
