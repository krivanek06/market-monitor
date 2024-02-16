import { TestBed } from '@angular/core/testing';
import { MarketApiService } from '@market-monitor/api-client';
import { PortfolioStateHoldings } from '@market-monitor/api-types';
import { calculateGrowth, getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import {
  mockSymbolSummaryAAPL,
  mockSymbolSummaryMSFT,
  testPreviousTransactionEmpty,
  testPreviousTransactionNonEmpty,
  testTransactionCreate_BUY_AAPL_1,
  testTransactionCreate_BUY_MSFT_1,
  testTransaction_BUY_AAPL_1,
  testTransaction_BUY_AAPL_2,
  testTransaction_BUY_MSFT_1,
  testTransaction_SELL_AAPL_1,
} from '../models';
import { PortfolioGrowthService } from './portfolio-growth.service';

describe('PortfolioGrowthService', () => {
  let service: PortfolioGrowthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioGrowthService,
        MockProvider(MarketApiService),
        // MockProvider(MarketApiService, {
        //   getHistoricalPricesDateRange: jest.fn(),
        //   getSymbolSummaries: jest.fn(),
        // }),
      ],
    }).compileComponents();

    service = TestBed.inject(PortfolioGrowthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      service.getPortfolioStateHoldings([testTransaction_BUY_AAPL_1], testPreviousTransactionEmpty).subscribe();

      expect(marketApiService.getSymbolSummaries).toHaveBeenCalled();
    });

    it('should return holding for one transaction and empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL])),
      });

      // expected result
      const expectedResult = {
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 0,
        transactionFees: 0,
        cashOnHand: 0,
        balance: 1400,
        invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
        holdingsBalance: 1400,
        totalGainsValue: 400,
        totalGainsPercentage: 40,
        startingCash: 0,
        firstTransactionDate: '2023-09-04',
        lastTransactionDate: '2023-09-04',
        date: getCurrentDateDefaultFormat(),
        previousBalanceChange: 0,
        previousBalanceChangePercentage: 0,
        accountResetDate: '2023-09-01',
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

      service.getPortfolioStateHoldings([testTransaction_BUY_AAPL_1], testPreviousTransactionEmpty).subscribe({
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
        numberOfExecutedBuyTransactions: 1,
        numberOfExecutedSellTransactions: 0,
        transactionFees: 0,
        cashOnHand: 0,
        balance: 1400,
        invested: testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice,
        holdingsBalance: 1400,
        totalGainsValue: 400,
        totalGainsPercentage: 40,
        startingCash: 0,
        firstTransactionDate: '2023-09-04',
        lastTransactionDate: '2023-09-04',
        date: getCurrentDateDefaultFormat(),
        previousBalanceChange: -10600,
        previousBalanceChangePercentage: -88.33,
        accountResetDate: '2023-09-01',
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

      service.getPortfolioStateHoldings([testTransaction_BUY_AAPL_1], testPreviousTransactionNonEmpty).subscribe({
        next: (res) => {
          expect(res).toEqual(expectedResult);
          done();
        },
        error: done.fail,
      });
    });

    it('should return holding for multiple transaction and empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL, mockSymbolSummaryMSFT])),
      });
      // holding units * current market price
      const expectedBalance =
        (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units) *
          mockSymbolSummaryAAPL.quote.price +
        testTransaction_BUY_MSFT_1.units * mockSymbolSummaryMSFT.quote.price;

      const feesPaid = testTransaction_BUY_AAPL_2.transactionFees + testTransaction_SELL_AAPL_1.transactionFees;
      const invested =
        testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice +
        testTransaction_BUY_AAPL_2.units * testTransaction_BUY_AAPL_2.unitPrice +
        testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice -
        testTransaction_SELL_AAPL_1.units * testTransaction_SELL_AAPL_1.unitPrice;

      // expected result
      const expectedResult = {
        numberOfExecutedBuyTransactions: 3,
        numberOfExecutedSellTransactions: 1,
        transactionFees: feesPaid,
        cashOnHand: 0,
        balance: expectedBalance - feesPaid,
        invested: invested,
        holdingsBalance: expectedBalance - feesPaid,
        totalGainsValue: expectedBalance - invested - feesPaid,
        totalGainsPercentage: calculateGrowth(expectedBalance - feesPaid, invested),
        startingCash: 0,
        firstTransactionDate: testTransactionCreate_BUY_AAPL_1.date,
        lastTransactionDate: testTransactionCreate_BUY_MSFT_1.date,
        date: getCurrentDateDefaultFormat(),
        previousBalanceChange: 0,
        previousBalanceChangePercentage: 0,
        accountResetDate: testPreviousTransactionEmpty.accountResetDate,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: testTransaction_BUY_AAPL_1.symbol,
            units:
              testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units,
            invested:
              testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice +
              testTransaction_BUY_AAPL_2.units * testTransaction_BUY_AAPL_2.unitPrice -
              testTransaction_SELL_AAPL_1.units * testTransaction_SELL_AAPL_1.unitPrice,
            breakEvenPrice: 95,
            weight: 0.526316,
            symbolSummary: mockSymbolSummaryAAPL,
          },
          {
            symbolType: 'STOCK',
            symbol: testTransaction_BUY_MSFT_1.symbol,
            units: testTransaction_BUY_MSFT_1.units,
            invested: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
            breakEvenPrice: testTransaction_BUY_MSFT_1.unitPrice,
            weight: 0.473684,
            symbolSummary: mockSymbolSummaryMSFT,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service
        .getPortfolioStateHoldings(
          [
            testTransaction_BUY_AAPL_1,
            testTransaction_BUY_AAPL_2,
            testTransaction_SELL_AAPL_1,
            testTransaction_BUY_MSFT_1,
          ],
          testPreviousTransactionEmpty,
        )
        .subscribe({
          next: (res) => {
            console.log('res', res);
            expect(res).toEqual(expectedResult);
            done();
          },
          error: done.fail,
        });
    });

    it('should return holding for multiple transaction and non-empty previous portfolio state', (done) => {
      // mock methods
      const marketApiService = TestBed.inject(MarketApiService);
      ngMocks.stub(marketApiService, {
        getSymbolSummaries: jest.fn().mockReturnValue(of([mockSymbolSummaryAAPL, mockSymbolSummaryMSFT])),
      });
      // holding units * current market price
      const expectedBalance =
        (testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units) *
          mockSymbolSummaryAAPL.quote.price +
        testTransaction_BUY_MSFT_1.units * mockSymbolSummaryMSFT.quote.price;

      const feesPaid = testTransaction_BUY_AAPL_2.transactionFees + testTransaction_SELL_AAPL_1.transactionFees;
      const invested =
        testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice +
        testTransaction_BUY_AAPL_2.units * testTransaction_BUY_AAPL_2.unitPrice +
        testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice -
        testTransaction_SELL_AAPL_1.units * testTransaction_SELL_AAPL_1.unitPrice;

      // expected result
      const expectedResult = {
        numberOfExecutedBuyTransactions: 3,
        numberOfExecutedSellTransactions: 1,
        transactionFees: feesPaid,
        cashOnHand: 0,
        balance: expectedBalance - feesPaid,
        invested: invested,
        holdingsBalance: expectedBalance - feesPaid,
        totalGainsValue: expectedBalance - invested - feesPaid,
        totalGainsPercentage: calculateGrowth(expectedBalance - feesPaid, invested),
        startingCash: 0,
        firstTransactionDate: testTransactionCreate_BUY_AAPL_1.date,
        lastTransactionDate: testTransactionCreate_BUY_MSFT_1.date,
        date: getCurrentDateDefaultFormat(),
        previousBalanceChange: expectedBalance - feesPaid - testPreviousTransactionNonEmpty.balance,
        previousBalanceChangePercentage: calculateGrowth(
          expectedBalance - feesPaid,
          testPreviousTransactionNonEmpty.balance,
        ),
        accountResetDate: testPreviousTransactionEmpty.accountResetDate,
        holdings: [
          {
            symbolType: 'STOCK',
            symbol: testTransaction_BUY_AAPL_1.symbol,
            units:
              testTransaction_BUY_AAPL_1.units + testTransaction_BUY_AAPL_2.units - testTransaction_SELL_AAPL_1.units,
            invested:
              testTransaction_BUY_AAPL_1.units * testTransaction_BUY_AAPL_1.unitPrice +
              testTransaction_BUY_AAPL_2.units * testTransaction_BUY_AAPL_2.unitPrice -
              testTransaction_SELL_AAPL_1.units * testTransaction_SELL_AAPL_1.unitPrice,
            breakEvenPrice: 95,
            weight: 0.526316,
            symbolSummary: mockSymbolSummaryAAPL,
          },
          {
            symbolType: 'STOCK',
            symbol: testTransaction_BUY_MSFT_1.symbol,
            units: testTransaction_BUY_MSFT_1.units,
            invested: testTransaction_BUY_MSFT_1.units * testTransaction_BUY_MSFT_1.unitPrice,
            breakEvenPrice: testTransaction_BUY_MSFT_1.unitPrice,
            weight: 0.473684,
            symbolSummary: mockSymbolSummaryMSFT,
          },
        ],
      } satisfies PortfolioStateHoldings;

      service
        .getPortfolioStateHoldings(
          [
            testTransaction_BUY_AAPL_1,
            testTransaction_BUY_AAPL_2,
            testTransaction_SELL_AAPL_1,
            testTransaction_BUY_MSFT_1,
          ],
          testPreviousTransactionNonEmpty,
        )
        .subscribe({
          next: (res) => {
            console.log('res', res);
            expect(res).toEqual(expectedResult);
            done();
          },
          error: done.fail,
        });
    });
  });
});
