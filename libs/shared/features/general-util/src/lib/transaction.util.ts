import {
  OutstandingOrder,
  PortfolioState,
  PortfolioStateHoldingBase,
  PortfolioTransaction,
  PortfolioTransactionMore,
  TRANSACTION_FEE_PRCT,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_HOLDING_LIMIT_ERROR,
  USER_HOLDINGS_SYMBOL_LIMIT,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserBaseMin,
} from '@mm/api-types';
import { isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentDateDetailsFormat } from './date-service.util';
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
  { id: userId }: UserBaseMin,
  holdings: PortfolioStateHoldingBase[],
  input: OutstandingOrder,
  currentPrice: number,
): PortfolioTransaction => {
  const isSell = input.orderType.type === 'SELL';

  // current price of the symbol
  const unitPrice = currentPrice;

  // from holdings get break even price
  const symbolHolding = holdings.find((d) => d.symbol === input.symbol);

  // on sell order, holdings must exists
  if (isSell && !symbolHolding) {
    throw new Error('Symbol holding not found');
  }

  // calculate break even price if SELL order
  const breakEvenPrice = isSell ? roundNDigits(symbolHolding?.breakEvenPrice ?? 1, 4) : 0;

  // calculate transaction fees
  const transactionFeesCalc = getTransactionFees(unitPrice, input.units);
  const transactionFees = roundNDigits(transactionFeesCalc);

  // calculate return values if SELL order
  const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
  const returnChange = isSell ? calculateGrowth(unitPrice, breakEvenPrice) : 0;

  const result: PortfolioTransaction = {
    transactionId: uuidv4(),
    date: input.createdAt,
    symbol: input.symbol,
    units: input.units,
    sector: input.sector,
    transactionType: input.orderType.type,
    userId: userId,
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

export const createTransactionMoreInfo = (
  userBaseMin: UserBaseMin,
  holdings: PortfolioStateHoldingBase[],
  input: OutstandingOrder,
  currentPrice: number,
): PortfolioTransactionMore => {
  const transaction = createTransaction(userBaseMin, holdings, input, currentPrice);

  return {
    ...transaction,
    userDisplayName: userBaseMin.personal.displayName,
    userPhotoURL: userBaseMin.personal.photoURL,
    userDisplayNameInitials: userBaseMin.personal.displayNameInitials,
  };
};

export const getTransactionFeesBySpending = (spending: number) => roundNDigits(spending * TRANSACTION_FEE_PRCT);

export const getTransactionFees = (unitPrice: number, units: number) =>
  roundNDigits(units * unitPrice * TRANSACTION_FEE_PRCT);

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
  portfolioState: PortfolioState,
  holdingSnapshot: PortfolioStateHoldingBase[],
  order: OutstandingOrder,
): void => {
  // negative units
  if (order.units <= 0) {
    throw new Error(TRANSACTION_INPUT_UNITS_POSITIVE);
  }

  // check if units is integer
  if (order.symbolType !== 'CRYPTO' && !Number.isInteger(order.units)) {
    throw new Error(TRANSACTION_INPUT_UNITS_INTEGER);
  }

  // calculate total value
  const potentialFees = getTransactionFeesBySpending(order.potentialTotalPrice);
  const totalValue = order.potentialTotalPrice + potentialFees;

  // BUY order
  if (order.orderType.type === 'BUY') {
    // check if user has enough cash on hand if BUY and cashAccountActive
    if (portfolioState.cashOnHand < totalValue) {
      throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
    }

    // check if user can buy this symbol - will not go over limit
    const hasInHolding = holdingSnapshot.find((d) => d.symbol === order.symbol);
    if (!hasInHolding && holdingSnapshot.length >= USER_HOLDINGS_SYMBOL_LIMIT) {
      throw new Error(USER_HOLDING_LIMIT_ERROR);
    }
  }
  // SELL order
  else if (order.orderType.type === 'SELL') {
    // check if user has any holdings of that symbol
    const symbolHoldings = holdingSnapshot.find((d) => d.symbol === order.symbol);

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
