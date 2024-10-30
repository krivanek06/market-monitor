import { TestBed } from '@angular/core/testing';

import { MarketApiService } from '@mm/api-client';
import {
  DATE_TOO_OLD,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  HistoricalPrice,
  OutstandingOrder,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_HOLDINGS_SYMBOL_LIMIT,
  USER_HOLDING_LIMIT_ERROR,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserAccountEnum,
  UserData,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { calculateGrowth, roundNDigits } from '@mm/shared/general-util';
import { format, subYears } from 'date-fns';
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
        MockProvider(AuthenticationUserStoreService, {
          addUserPortfolioTransactions: jest.fn(),
          addOutstandingOrder: jest.fn(),
          removeOutstandingOrder: jest.fn(),
        }),
        MockProvider(MarketApiService, {
          isMarketOpenForQuote: jest.fn().mockReturnValue(true),
        }),
      ],
    });
    service = TestBed.inject(PortfolioCreateOperationService);

    // mock response
    const stocksApiService = TestBed.inject(MarketApiService);
    ngMocks.stub(stocksApiService, {
      getHistoricalPricesOnDate: jest.fn().mockReturnValue(of(randomSymboLPrice)),
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test: createOrder', () => {
    describe('Create Transaction - Market is open', () => {
      it('should create a BUY transaction', () => {
        const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);

        const t1 = {
          symbol: 'AAPL',
          createdAt: randomDate,
          symbolType: 'STOCK',
          units: 10,
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
        } as OutstandingOrder;

        const user = {
          ...testUserData,
          portfolioState: {
            ...testUserData.portfolioState,
            cashOnHand: 10_000,
          },
        } satisfies UserData;

        const transaction = service.createOrder(user, t1);

        expect(transaction).toMatchObject({
          type: 'transaction',
          data: {
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
          },
        });

        expect(authenticationUserStoreService.addUserPortfolioTransactions).toHaveBeenLastCalledWith(transaction.data);
        expect(authenticationUserStoreService.addOutstandingOrder).not.toHaveBeenCalled();
      });

      it('should create a SELL transaction (1)', () => {
        const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);

        const t1 = {
          symbol: 'AAPL',
          createdAt: randomDate,
          symbolType: 'STOCK',
          units: 10,
          sector: 'Technology',
          orderType: {
            type: 'SELL',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
        } as OutstandingOrder;

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
                symbol: t1.symbol,
                symbolType: t1.symbolType,
                units: 10,
                sector: t1.sector,
                breakEvenPrice: 20,
              },
            ],
          },
        } satisfies UserData;

        const breakEvenPrice = user.holdingSnapshot.data[0].breakEvenPrice;
        const returnValue = roundNDigits((randomSymboLPrice.close - breakEvenPrice) * t1.units);
        const returnChange = calculateGrowth(randomSymboLPrice.close, breakEvenPrice);
        const transactionFeesCalc = roundNDigits(((t1.units * randomSymboLPrice.close) / 100) * TRANSACTION_FEE_PRCT);

        const result = service.createOrder(user, t1);
        expect(result).toMatchObject({
          type: 'transaction',
          data: {
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
          },
        });

        expect(authenticationUserStoreService.addUserPortfolioTransactions).toHaveBeenLastCalledWith(result.data);
        expect(authenticationUserStoreService.addOutstandingOrder).not.toHaveBeenCalled();
      });

      it('should create a SELL transaction (2)', () => {
        const t1 = {
          symbol: 'MSFT',
          createdAt: randomDate,
          symbolType: 'STOCK',
          units: 8,
          sector: 'Technology',
          orderType: {
            type: 'SELL',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
        } as OutstandingOrder;

        const user = {
          ...testUserData,
          portfolioState: {
            ...testUserData.portfolioState,
          },
          holdingSnapshot: {
            lastModifiedDate: randomDate,
            data: [
              {
                invested: 2500,
                symbol: t1.symbol,
                symbolType: t1.symbolType,
                units: 12,
                sector: t1.sector,
                breakEvenPrice: 208.34, // 2500 / 12
              },
            ],
          },
        } satisfies UserData;

        const breakEvenPrice = user.holdingSnapshot.data[0].breakEvenPrice;
        const returnValue = roundNDigits((randomSymboLPrice.close - breakEvenPrice) * t1.units);
        const returnChange = calculateGrowth(randomSymboLPrice.close, breakEvenPrice);
        const transactionFeesCalc = roundNDigits(((t1.units * randomSymboLPrice.close) / 100) * TRANSACTION_FEE_PRCT);

        expect(service.createOrder(user, t1)).toMatchObject({
          type: 'transaction',
          data: {
            date: expect.any(String),
            returnChange: returnChange,
            returnValue: returnValue,
            symbol: t1.symbol,
            symbolType: t1.symbolType,
            transactionFees: transactionFeesCalc,
            transactionId: expect.any(String),
            transactionType: 'SELL',
            unitPrice: randomSymboLPrice.close,
            units: t1.units,
            userId: testUserData.id,
          },
        });
      });

      it('should create a BUY transaction over holding limit if user already has the symbol in holdings', () => {
        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: `AAPL0`,
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
        } as OutstandingOrder;

        const userData = {
          ...testUserData,
          holdingSnapshot: {
            ...testUserData.holdingSnapshot,
            data: Array.from({ length: USER_HOLDINGS_SYMBOL_LIMIT }, (_, i) => ({
              invested: 100,
              symbol: `AAPL${i}`,
              symbolType: 'STOCK',
              units: 10,
              sector: 'Technology',
              breakEvenPrice: 10,
            })),
          },
        } satisfies UserData;

        expect(service.createOrder(userData, t1)).toMatchObject({
          type: 'transaction',
          data: {
            date: expect.any(String),
            returnChange: expect.any(Number),
            returnValue: expect.any(Number),
            symbol: t1.symbol,
            symbolType: expect.any(String),
            transactionFees: expect.any(Number),
            transactionId: expect.any(String),
            transactionType: expect.any(String),
            unitPrice: expect.any(Number),
            units: expect.any(Number),
            userId: userData.id,
          },
        });
      });
    });

    describe('Create Outstanding Order - Market is closed', () => {
      it('should create a BUY outstanding order', () => {
        const marketApiService = ngMocks.get(MarketApiService);
        ngMocks.stub(marketApiService, {
          isMarketOpenForQuote: jest.fn().mockReturnValue(false),
        });
        ngMocks.flushTestBed();

        const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);

        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: `AAPL0`,
          displaySymbol: `AAPL0`,
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
          potentialTotalPrice: 10 * randomSymboLPrice.close,
        } as OutstandingOrder;

        const user = {
          ...testUserData,
          portfolioState: {
            ...testUserData.portfolioState,
            cashOnHand: 10_000,
          },
        } satisfies UserData;

        const outstandingOrder = service.createOrder(user, t1);

        expect(outstandingOrder).toMatchObject({
          type: 'order',
          data: {
            createdAt: randomDate,
            displaySymbol: t1.symbol,
            orderType: t1.orderType,
            potentialTotalPrice: t1.units * randomSymboLPrice.close,
            potentialSymbolPrice: randomSymboLPrice.close,
            symbol: t1.symbol,
            symbolType: t1.symbolType,
            units: t1.units,
            userData: t1.userData,
          },
        });

        expect(authenticationUserStoreService.addUserPortfolioTransactions).not.toHaveBeenCalled();
        expect(authenticationUserStoreService.addOutstandingOrder).toHaveBeenLastCalledWith(outstandingOrder.data);
      });

      it('should create a SELL outstanding order', () => {
        const marketApiService = ngMocks.get(MarketApiService);
        ngMocks.stub(marketApiService, {
          isMarketOpenForQuote: jest.fn().mockReturnValue(false),
        });
        ngMocks.flushTestBed();

        const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);

        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: `AAPL0`,
          displaySymbol: `AAPL0`,
          symbolType: 'STOCK',
          orderType: {
            type: 'SELL',
          },
          userData: {
            id: testUserData.id,
          },
          potentialSymbolPrice: randomSymboLPrice.close,
          potentialTotalPrice: 10 * randomSymboLPrice.close,
        } as OutstandingOrder;

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
                invested: 2500,
                symbol: t1.symbol,
                symbolType: t1.symbolType,
                units: 12,
                sector: t1.sector,
                breakEvenPrice: 208.34, // 2500 / 12
              },
            ],
          },
        } satisfies UserData;

        const outstandingOrder = service.createOrder(user, t1);

        expect(outstandingOrder).toMatchObject({
          type: 'order',
          data: {
            createdAt: randomDate,
            displaySymbol: t1.symbol,
            orderType: t1.orderType,
            potentialTotalPrice: t1.units * randomSymboLPrice.close,
            potentialSymbolPrice: randomSymboLPrice.close,
            symbol: t1.symbol,
            symbolType: t1.symbolType,
            units: t1.units,
            userData: t1.userData,
          },
        });

        expect(authenticationUserStoreService.addUserPortfolioTransactions).not.toHaveBeenCalled();
        expect(authenticationUserStoreService.addOutstandingOrder).toHaveBeenLastCalledWith(outstandingOrder.data);
      });
    });

    describe('Error states', () => {
      it('should throw error if units are negative or zero', () => {
        const t1 = {
          createdAt: randomDate,
          units: 0,
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;
        const t2 = {
          createdAt: randomDate,
          units: -1,
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        expect(() => service.createOrder(testUserData, t1)).toThrow(TRANSACTION_INPUT_UNITS_POSITIVE);
        expect(() => service.createOrder(testUserData, t2)).toThrow(TRANSACTION_INPUT_UNITS_POSITIVE);
      });

      it('should throw error if units are non integer values for not crypto', () => {
        const t1 = {
          createdAt: randomDate,
          units: 10.5,
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        expect(() => service.createOrder(testUserData, t1)).toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
      });

      it('should throw error if user wants to buy symbol over holding limit', () => {
        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: 'AAPL_1234',
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        const userData = {
          ...testUserData,
          holdingSnapshot: {
            ...testUserData.holdingSnapshot,
            data: Array.from({ length: USER_HOLDINGS_SYMBOL_LIMIT }, (_, i) => ({
              invested: 100,
              symbol: `AAPL${i}`,
              symbolType: 'STOCK',
              units: 10,
              sector: 'Technology',
              breakEvenPrice: 10,
            })),
          },
        } satisfies UserData;

        expect(() => service.createOrder(userData, t1)).toThrow(USER_HOLDING_LIMIT_ERROR);
      });

      it('should throw error if loading data older than (HISTORICAL_PRICE_RESTRICTION_YEARS)', () => {
        const t1 = {
          createdAt: format(subYears(new Date(), HISTORICAL_PRICE_RESTRICTION_YEARS + 1), 'yyyy-MM-dd'),
          units: 10,
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        expect(() => service.createOrder(testUserData, t1)).toThrow(DATE_TOO_OLD);
      });

      it('should throw error if user does not have enough cash for BUY operation when using DEMO_TRADING Account', () => {
        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: 'AAPL',
          symbolType: 'STOCK',
          orderType: {
            type: 'BUY',
          },
          potentialTotalPrice: 1,
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        const userData = {
          ...testUserData,
          portfolioState: {
            ...testUserData.portfolioState,
            cashOnHand: 0,
          },
        } satisfies UserData;

        expect(() => service.createOrder(userData, t1)).toThrow(USER_NOT_ENOUGH_CASH_ERROR);
      });

      it('should throw error if user does not have enough units on hand for SELL operation', () => {
        const t1 = {
          createdAt: randomDate,
          units: 10,
          symbol: 'AAPL',
          symbolType: 'STOCK',
          orderType: {
            type: 'SELL',
          },
          userData: {
            id: testUserData.id,
          },
        } as OutstandingOrder;

        const userData = {
          ...testUserData,
          holdingSnapshot: {
            ...testUserData.holdingSnapshot,
            data: [
              {
                invested: 100,
                symbol: 'AAPL',
                symbolType: 'STOCK',
                units: 9, // one less than the SELL order
                sector: 'Technology',
                breakEvenPrice: 10,
              },
            ],
          },
        } satisfies UserData;

        // not enough units
        expect(() => service.createOrder(userData, t1)).toThrow(USER_NOT_UNITS_ON_HAND_ERROR);
        // does not exist
        expect(() => service.createOrder(testUserData, t1)).toThrow(USER_NOT_UNITS_ON_HAND_ERROR);
      });
    });
  });

  describe('Test: deleteOrder', () => {
    it('should delete an outstanding order', () => {
      const order = {
        userData: {
          id: testUserData.id,
        },
      } as OutstandingOrder;

      const user = {
        ...testUserData,
      } satisfies UserData;

      const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
      service.deleteOrder(order, user);

      expect(authenticationUserStoreService.removeOutstandingOrder).toHaveBeenLastCalledWith(order);
    });

    it('should throw error if user deleting someone else order', () => {
      const order = {
        userData: {
          id: 'INVALID ID',
        },
      } as OutstandingOrder;

      const user = {
        ...testUserData,
      } satisfies UserData;

      const authenticationUserStoreService = ngMocks.get(AuthenticationUserStoreService);
      expect(() => service.deleteOrder(order, user)).toThrow(expect.any(Error));

      expect(authenticationUserStoreService.removeOutstandingOrder).not.toHaveBeenCalled();
    });
  });
});
