import { TestBed } from '@angular/core/testing';

import { StocksApiService, UserApiService } from '@mm/api-client';
import {
  DATE_TOO_OLD,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  HistoricalPrice,
  PortfolioTransactionCreate,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserAccountEnum,
  UserData,
  mockCreateUser,
} from '@mm/api-types';
import { roundNDigits } from '@mm/shared/general-util';
import { endOfDay, format, subYears } from 'date-fns';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { PortfolioCreateOperationService } from './portfolio-create-operation.service';

describe('PortfolioCreateOperationService', () => {
  let service: PortfolioCreateOperationService;

  // April 5, 2024 - Friday -> random date
  const randomDate = '2024-04-05';
  const randomSymboLPrice: HistoricalPrice = {
    close: 10,
    date: randomDate,
    volume: 10_000,
  };

  const testUserData = mockCreateUser({
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(UserApiService, {
          addUserPortfolioTransactions: jest.fn(),
        }),
        MockProvider(StocksApiService),
      ],
    });
    service = TestBed.inject(PortfolioCreateOperationService);

    // mock response
    const stocksApiService = TestBed.inject(StocksApiService);
    ngMocks.stub(stocksApiService, {
      getStockHistoricalPricesOnDate: jest.fn().mockReturnValue(of(randomSymboLPrice)),
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: createPortfolioCreateOperation', () => {
    it('should create a BUY transaction', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: randomDate,
        symbolType: 'STOCK',
        transactionType: 'BUY',
        units: 10,
      } as PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
      } satisfies UserData;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: expect.any(String),
        returnChange: 0,
        returnValue: 0,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: expect.any(Number),
        transactionId: expect.any(String),
        transactionType: 'BUY',
        unitPrice: randomSymboLPrice.close,
        units: t1.units,
        userId: testUserData.id,
      });
    });

    it('should create a BUY transaction when holding the symbol', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: randomDate,
        symbolType: 'STOCK',
        transactionType: 'BUY',
        units: 10,
      } as PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
        holdingSnapshot: {
          lastModifiedDate: randomDate,
          data: [
            {
              invested: 100,
              symbol: 'AAPL',
              symbolType: 'STOCK',
              units: 10,
            },
          ],
        },
      } satisfies UserData;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: expect.any(String),
        returnChange: 0,
        returnValue: 0,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: expect.any(Number),
        transactionId: expect.any(String),
        transactionType: 'BUY',
        unitPrice: randomSymboLPrice.close,
        units: t1.units,
        userId: testUserData.id,
      });
    });

    it('should create a BUY transaction with custom value for BASIC Account', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: randomDate,
        symbolType: 'STOCK',
        transactionType: 'BUY',
        units: 10,
        customTotalValue: 300,
      } satisfies PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
        userAccountType: UserAccountEnum.NORMAL_BASIC,
      } satisfies UserData;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: expect.any(String),
        returnChange: 0,
        returnValue: 0,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: 0,
        transactionId: expect.any(String),
        transactionType: 'BUY',
        unitPrice: roundNDigits(t1.customTotalValue / t1.units),
        units: t1.units,
        userId: testUserData.id,
      });
    });

    it('should create a BUY transaction ignoring custom value for DEMO Account', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: randomDate,
        symbolType: 'STOCK',
        transactionType: 'BUY',
        units: 10,
        customTotalValue: 300,
      } satisfies PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
        userAccountType: UserAccountEnum.DEMO_TRADING,
      } satisfies UserData;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: expect.any(String),
        returnChange: 0,
        returnValue: 0,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: 0.1,
        transactionId: expect.any(String),
        transactionType: 'BUY',
        unitPrice: randomSymboLPrice.close,
        units: t1.units,
        userId: testUserData.id,
      });
    });

    it('should create a SELL transaction', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: randomDate,
        symbolType: 'STOCK',
        transactionType: 'SELL',
        units: 10,
      } as PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
        holdingSnapshot: {
          lastModifiedDate: randomDate,
          data: [
            {
              invested: 200,
              symbol: 'AAPL',
              symbolType: 'STOCK',
              units: 10,
            },
          ],
        },
      } satisfies UserData;

      const breakEvenPrice = roundNDigits(200 / 10);
      const returnValue = roundNDigits((randomSymboLPrice.close - breakEvenPrice) * t1.units);
      const returnChange = roundNDigits((randomSymboLPrice.close - breakEvenPrice) / breakEvenPrice);
      const transactionFeesCalc = ((t1.units * randomSymboLPrice.close) / 100) * TRANSACTION_FEE_PRCT;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: expect.any(String),
        returnChange: returnChange,
        returnValue: returnValue,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: transactionFeesCalc,
        transactionId: expect.any(String),
        transactionType: 'SELL',
        unitPrice: randomSymboLPrice.close,
        units: t1.units,
        userId: testUserData.id,
      });
    });

    it('should change data from weekend to last working date', async () => {
      const t1 = {
        symbol: 'AAPL',
        date: '2024-04-07', // Sunday
        symbolType: 'STOCK',
        transactionType: 'BUY',
        units: 10,
      } as PortfolioTransactionCreate;

      const user = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 10_000,
        },
      } satisfies UserData;

      await expect(service.createPortfolioCreateOperation(user, t1)).resolves.toMatchObject({
        date: format(endOfDay(t1.date), 'yyyy-MM-dd HH:mm:ss'),
        returnChange: 0,
        returnValue: 0,
        symbol: 'AAPL',
        symbolType: 'STOCK',
        transactionFees: expect.any(Number),
        transactionId: expect.any(String),
        transactionType: 'BUY',
        unitPrice: randomSymboLPrice.close,
        units: t1.units,
        userId: testUserData.id,
      });
    });

    describe('Error states', () => {
      it('should throw error if symbol not found', async () => {
        const stocksApiService = TestBed.inject(StocksApiService);
        ngMocks.stub(stocksApiService, {
          getStockHistoricalPricesOnDate: jest.fn().mockReturnValue(of(null)),
        });

        const emptyTransaction = {
          date: randomDate,
        } as PortfolioTransactionCreate;

        await expect(service.createPortfolioCreateOperation(testUserData, emptyTransaction)).rejects.toThrow(
          SYMBOL_NOT_FOUND_ERROR,
        );
      });

      it('should throw error if units are negative or zero', async () => {
        const t1 = {
          date: randomDate,
          units: 0,
        } as PortfolioTransactionCreate;
        const t2 = {
          date: randomDate,
          units: -1,
        } as PortfolioTransactionCreate;

        await expect(service.createPortfolioCreateOperation(testUserData, t1)).rejects.toThrow(
          TRANSACTION_INPUT_UNITS_POSITIVE,
        );
        await expect(service.createPortfolioCreateOperation(testUserData, t2)).rejects.toThrow(
          TRANSACTION_INPUT_UNITS_POSITIVE,
        );
      });

      it('should throw error if units are non integer values for not crypto', async () => {
        const t1 = {
          date: randomDate,
          units: 10.5,
          symbolType: 'STOCK',
        } as PortfolioTransactionCreate;

        await expect(service.createPortfolioCreateOperation(testUserData, t1)).rejects.toThrow(
          TRANSACTION_INPUT_UNITS_INTEGER,
        );
      });

      it('should throw error if loading data older than (HISTORICAL_PRICE_RESTRICTION_YEARS)', async () => {
        const t1 = {
          date: format(subYears(new Date(), HISTORICAL_PRICE_RESTRICTION_YEARS + 1), 'yyyy-MM-dd'),
          units: 10,
          symbolType: 'STOCK',
        } as PortfolioTransactionCreate;

        await expect(service.createPortfolioCreateOperation(testUserData, t1)).rejects.toThrow(DATE_TOO_OLD);
      });

      it('should throw error if user does not have enough cash for BUY operation when using DEMO_TRADING Account', async () => {
        const t1 = {
          date: randomDate,
          units: 10,
          symbol: 'AAPL',
          transactionType: 'BUY',
          symbolType: 'STOCK',
        } as PortfolioTransactionCreate;

        const userData = {
          ...testUserData,
          portfolioState: {
            ...testUserData.portfolioState,
            cashOnHand: 0,
          },
        } satisfies UserData;

        await expect(service.createPortfolioCreateOperation(userData, t1)).rejects.toThrow(USER_NOT_ENOUGH_CASH_ERROR);
      });

      it('should throw error if user does not have enough units on hand for SELL operation', async () => {
        const t1 = {
          date: randomDate,
          units: 10,
          symbol: 'AAPL',
          transactionType: 'SELL',
          symbolType: 'STOCK',
        } as PortfolioTransactionCreate;

        const userData = {
          ...testUserData,
          holdingSnapshot: {
            ...testUserData.holdingSnapshot,
            data: [
              {
                invested: 100,
                symbol: 'AAPL',
                symbolType: 'STOCK',
                units: 9,
              },
            ],
          },
        } satisfies UserData;

        // not enough units
        await expect(service.createPortfolioCreateOperation(userData, t1)).rejects.toThrow(
          USER_NOT_UNITS_ON_HAND_ERROR,
        );
        // does not exist
        await expect(service.createPortfolioCreateOperation(testUserData, t1)).rejects.toThrow(
          USER_NOT_UNITS_ON_HAND_ERROR,
        );
      });
    });
  });
});
