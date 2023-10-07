import { PortfolioTransaction } from '@market-monitor/api-types';
import { PortfolioTransactionCreate } from '../portfolio-operation';
import { USER_TEST_1_ID } from './test-user.model';

export const mockCreatePortfolioTransactionCreate = (
  input?: Partial<PortfolioTransactionCreate>,
): PortfolioTransactionCreate => {
  const data: PortfolioTransactionCreate = {
    date: '2020-01-01',
    symbol: 'AAPL',
    transactionType: 'BUY',
    units: 1,
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
    unitPrice: 100,
    userId: USER_TEST_1_ID,
    ...input,
  };

  return data;
};

export const testTransactionCreate_BUY_AAPL_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 10,
  date: '2023-09-04',
  transactionType: 'BUY',
});

export const testTransaction_BUY_AAPL_1 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_AAPL_1.symbol,
  units: testTransactionCreate_BUY_AAPL_1.units,
  date: testTransactionCreate_BUY_AAPL_1.date,
  transactionType: testTransactionCreate_BUY_AAPL_1.transactionType,
  unitPrice: 45.5,
});

export const testTransactionCreate_BUY_AAPL_2 = mockCreatePortfolioTransactionCreate({
  symbol: 'AAPL',
  units: 5,
  date: '2023-09-11',
});

export const testTransaction_BUY_AAPL_2 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_AAPL_2.symbol,
  units: testTransactionCreate_BUY_AAPL_2.units,
  date: testTransactionCreate_BUY_AAPL_2.date,
  transactionType: testTransactionCreate_BUY_AAPL_2.transactionType,
  unitPrice: 123.21,
});

export const testTransactionCreate_BUY_MSFT_1 = mockCreatePortfolioTransactionCreate({
  symbol: 'MSFT',
  units: 10,
  date: '2023-09-07',
  transactionType: 'BUY',
});

export const testTransaction_BUY_MSFT_1 = mockPortfolioTransaction({
  symbol: testTransactionCreate_BUY_MSFT_1.symbol,
  units: testTransactionCreate_BUY_MSFT_1.units,
  date: testTransactionCreate_BUY_MSFT_1.date,
  transactionType: testTransactionCreate_BUY_MSFT_1.transactionType,
  unitPrice: 85.5,
});
