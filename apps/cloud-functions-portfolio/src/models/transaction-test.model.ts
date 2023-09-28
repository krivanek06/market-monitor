import { PortfolioTransaction, PortfolioTransactionCreate, UserPortfolioTransaction } from '@market-monitor/api-types';
import { USER_TEST_1_ID } from './user-test.model';

export const mockCreatePortfolioTransactionCreate = (
  input?: Partial<PortfolioTransactionCreate>,
): PortfolioTransactionCreate => {
  const data: PortfolioTransactionCreate = {
    date: '2020-01-01',
    symbol: 'AAPL',
    transactionType: 'BUY',
    units: 1,
    userId: USER_TEST_1_ID,
    symbolType: 'STOCK',
    ...input,
  };

  return data;
};

export const mockPortfolioTransaction = (input?: Partial<PortfolioTransaction>): PortfolioTransaction => {
  const data: PortfolioTransaction = {
    date: '2020-01-01',
    symbol: 'AAPL',
    transactionType: 'BUY',
    units: 0,
    symbolType: 'STOCK',
    returnChange: 0,
    returnValue: 0,
    transactionFees: 0,
    transactionId: new Date().getTime().toString(),
    unitPrice: 0,
    userId: USER_TEST_1_ID,
    userDisplayName: 'Test User',
    userPhotoURL: null,
    ...input,
  };

  return data;
};

export const testTransactionCreate_BUY_AAPL_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 10,
  date: '2020-01-01',
  transactionType: 'BUY',
});

export const testTransaction_BUY_AAPL_1 = mockPortfolioTransaction({
  symbol: 'AAPL',
  units: 10,
  date: '2020-01-01',
  transactionType: 'BUY',
});

export const testTransactionCreate_BUY_AAPL_2 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 5,
  date: '2020-01-10',
});

export const testTransaction_BUY_AAPL_2 = mockPortfolioTransaction({
  symbol: 'AAPL',
  units: 5,
  date: '2020-01-10',
  transactionType: 'BUY',
});

export const userTestPortfolioTransaction1: UserPortfolioTransaction = {
  cashDeposit: [
    {
      transactionId: '1',
      amount: 1000,
      date: '2020-01-01',
    },
  ],
  transactions: [testTransaction_BUY_AAPL_1, testTransaction_BUY_AAPL_2],
};
