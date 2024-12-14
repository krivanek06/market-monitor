import {
  HistoricalPrice,
  mockCreateUser,
  OutstandingOrder,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_HOLDING_LIMIT_ERROR,
  USER_HOLDINGS_SYMBOL_LIMIT,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import { checkTransactionOperationDataValidity } from '../transaction.util';

describe('TransactionUtil', () => {
  describe('test: checkTransactionOperationDataValidity()', () => {
    const randomDate = '2024-04-05';
    const randomSymboLPrice: HistoricalPrice = {
      close: 10,
      date: randomDate,
      volume: 10_000,
    };

    const testUserData = mockCreateUser({
      userAccountType: UserAccountEnum.DEMO_TRADING,
    });

    it('should create a BUY transaction', () => {
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

      expect(() =>
        checkTransactionOperationDataValidity(testUserData.portfolioState, testUserData.holdingSnapshot.data, t1),
      ).not.toThrow();
    });

    it('should not throw error if units are non integer values for crypto', () => {
      const t1 = {
        createdAt: randomDate,
        units: 10.5,
        symbolType: 'CRYPTO',
        orderType: {
          type: 'BUY',
        },
        userData: {
          id: testUserData.id,
        },
      } as OutstandingOrder;

      expect(() =>
        checkTransactionOperationDataValidity(testUserData.portfolioState, testUserData.holdingSnapshot.data, t1),
      ).not.toThrow();
    });

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

      expect(() =>
        checkTransactionOperationDataValidity(testUserData.portfolioState, testUserData.holdingSnapshot.data, t1),
      ).toThrow(TRANSACTION_INPUT_UNITS_POSITIVE);
      expect(() =>
        checkTransactionOperationDataValidity(testUserData.portfolioState, testUserData.holdingSnapshot.data, t2),
      ).toThrow(TRANSACTION_INPUT_UNITS_POSITIVE);
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

      expect(() =>
        checkTransactionOperationDataValidity(testUserData.portfolioState, testUserData.holdingSnapshot.data, t1),
      ).toThrow(TRANSACTION_INPUT_UNITS_INTEGER);
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

      const userDataTest = {
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
      } as UserData;

      expect(() =>
        checkTransactionOperationDataValidity(userDataTest.portfolioState, userDataTest.holdingSnapshot.data, t1),
      ).toThrow(USER_HOLDING_LIMIT_ERROR);
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

      const userDataTest = {
        ...testUserData,
        portfolioState: {
          ...testUserData.portfolioState,
          cashOnHand: 0,
        },
      } as UserData;

      expect(() =>
        checkTransactionOperationDataValidity(userDataTest.portfolioState, userDataTest.holdingSnapshot.data, t1),
      ).toThrow(USER_NOT_ENOUGH_CASH_ERROR);
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

      const userDataTest = {
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
      } as UserData;

      // not enough units
      expect(() =>
        checkTransactionOperationDataValidity(userDataTest.portfolioState, userDataTest.holdingSnapshot.data, t1),
      ).toThrow(USER_NOT_UNITS_ON_HAND_ERROR);
    });
  });
});
