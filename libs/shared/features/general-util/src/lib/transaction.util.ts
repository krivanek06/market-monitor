import {
  DATE_TOO_OLD,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  OutstandingOrder,
  PortfolioTransaction,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_HOLDINGS_SYMBOL_LIMIT,
  USER_HOLDING_LIMIT_ERROR,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserData,
} from '@mm/api-types';
import { isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { dateGetDetailsInformationFromDate, getCurrentDateDetailsFormat } from './date-service.util';
import { calculateGrowth, roundNDigits } from './general-function.util';

/**
 * from user's every transaction, get distinct symbols with their first transaction date
 *
 * @param transactions - user's transactions
 * @returns - array of symbols with their first transaction date
 */
export const getTransactionsStartDate = (
  transactions: PortfolioTransaction[],
): { symbol: string; startDate: string }[] => {
  return transactions.reduce(
    (acc, curr) => {
      // check if symbol already exists
      const entry = acc.find((d) => d.symbol === curr.symbol);
      // add new entry if not exists
      if (!entry) {
        return [...acc, { symbol: curr.symbol, startDate: curr.date }];
      }
      // compare dates and update if sooner
      if (isBefore(curr.date, entry.startDate)) {
        return [...acc.filter((d) => d.symbol !== curr.symbol), { symbol: curr.symbol, startDate: curr.date }];
      }
      // else return original
      return acc;
    },
    [] as { symbol: string; startDate: string }[],
  );
};

/**
 * creates transaction from an outstanding order
 *
 * @param userDocData
 * @param input - outstanding order
 * @param currentPrice - current price of the symbol
 * @returns
 */
export const createTransaction = (
  userDocData: UserData,
  input: OutstandingOrder,
  currentPrice: number,
): PortfolioTransaction => {
  const isSell = input.orderType.type === 'SELL';

  // current price of the symbol
  const unitPrice = currentPrice;

  // from holdings get break even price
  const symbolHolding = userDocData.holdingSnapshot.data.find((d) => d.symbol === input.symbol);

  // calculate break even price if SELL order
  const breakEvenPrice = isSell ? roundNDigits(symbolHolding?.breakEvenPrice ?? 1, 2) : 0;

  // calculate return values if SELL order
  const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
  const returnChange = isSell ? calculateGrowth(unitPrice, breakEvenPrice) : 0;

  // transaction fees are 0.01% of the transaction value
  const transactionFeesCalc = ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT;
  const transactionFees = roundNDigits(transactionFeesCalc, 2);

  const result: PortfolioTransaction = {
    transactionId: uuidv4(),
    date: input.createdAt,
    symbol: input.symbol,
    units: input.units,
    sector: input.sector,
    transactionType: input.orderType.type,
    userId: userDocData.id,
    symbolType: input.symbolType,
    unitPrice,
    transactionFees,
    returnChange,
    returnValue,
    dateExecuted: getCurrentDateDetailsFormat(),
    displaySymbol: input.symbol.replace(input.symbolType === 'CRYPTO' ? 'USD' : '', ''),
  };

  return result;
};

/**
 * validates transaction order, whether the user has enough cash on hand
 * check to make:
 * - user exists
 * - user has enough cash on hand if BUY and cashAccountActive
 * - user has enough units on hand if SELL
 * - units: positive,
 * - date: valid, not weekend, not future, not too old
 * - symbol: exists
 *
 * @param order - transaction order user wants to create
 * @param currentPrice - current price of the symbol
 * @param userData - user who wants to create the transaction
 */
export const checkTransactionOperationDataValidity = (
  userData: UserData,
  order: OutstandingOrder,
  currentPrice: number,
): void => {
  // negative units
  if (order.units <= 0) {
    throw new Error(TRANSACTION_INPUT_UNITS_POSITIVE);
  }

  // check if units is integer
  if (order.symbolType !== 'CRYPTO' && !Number.isInteger(order.units)) {
    throw new Error(TRANSACTION_INPUT_UNITS_INTEGER);
  }

  // get year data form input and today
  const { year: inputYear } = dateGetDetailsInformationFromDate(order.createdAt);
  const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

  // prevent loading more than N year of asset data - just in case
  if (todayYear - inputYear > HISTORICAL_PRICE_RESTRICTION_YEARS) {
    throw new Error(DATE_TOO_OLD);
  }

  // calculate total value
  const totalValue = roundNDigits(order.units * currentPrice, 2);

  // BUY order
  if (order.orderType.type === 'BUY') {
    // check if user has enough cash on hand if BUY and cashAccountActive
    if (userData.portfolioState.cashOnHand < totalValue) {
      throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
    }

    // check if user can buy this symbol - will not go over limit
    const hasInHolding = userData.holdingSnapshot.data.find((d) => d.symbol === order.symbol);
    if (!hasInHolding && userData.holdingSnapshot.data.length >= USER_HOLDINGS_SYMBOL_LIMIT) {
      throw new Error(USER_HOLDING_LIMIT_ERROR);
    }
  }
  // SELL order
  else if (order.orderType.type === 'SELL') {
    // check if user has any holdings of that symbol
    const symbolHoldings = userData.holdingSnapshot.data.find((d) => d.symbol === order.symbol);

    // check if user has enough units on hand if SELL
    if ((symbolHoldings?.units ?? -1) < order.units) {
      throw new Error(USER_NOT_UNITS_ON_HAND_ERROR);
    }
  }
  // unsupported order type
  else {
    throw new Error('Order type not supported');
  }
};
