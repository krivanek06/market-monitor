import { getStockHistoricalPricesOnDate } from '@market-monitor/api-external';
import {
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  HistoricalPrice,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  TRANSACTION_FEE_PRCT,
  UserData,
} from '@market-monitor/api-types';
import {
  dateFormatDate,
  dateGetDetailsInformationFromDate,
  roundNDigits,
} from '@market-monitor/shared/features/general-util';
import { format, isBefore, isValid, isWeekend, subDays } from 'date-fns';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import {
  DATE_FUTURE,
  DATE_INVALID_DATE,
  DATE_TOO_OLD,
  DATE_WEEKEND,
  SYMBOL_NOT_FOUND_ERROR,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../models';

/**
 * Create a new transaction for the authenticated user
 */
export const portfolioCreateOperationCall = onCall(async (request) => {
  const userAuthId = request.auth?.uid;
  const data = request.data as PortfolioTransactionCreate;
  console.log('executing portfolioCreateOperationCall');

  if (!userAuthId) {
    throw new HttpsError('aborted', 'User is not authenticated');
  }

  return createPortfolioCreateOperation(userAuthId, data);
});

/**
 * creates a new transaction for the provided user
 *
 * @param userAuthId - user id to which to add the transaction
 * @param data - transaction data
 * @returns - newly created transaction
 */
export const createPortfolioCreateOperation = async (
  userAuthId: string,
  data: PortfolioTransactionCreate,
): Promise<PortfolioTransaction> => {
  const userDocRef = userDocumentRef(userAuthId);
  const userDocTransactionsRef = userDocumentTransactionHistoryRef(userAuthId);

  const userDocData = (await userDocRef.get()).data();
  const userTransactions = (await userDocTransactionsRef.get()).data()?.transactions;

  // check if user exists
  if (!userDocData || !userTransactions) {
    throw new HttpsError('not-found', 'User does not exist');
  }

  // if weekend is used format to last friday
  data.date = formatWeekendDate(data.date);

  // load historical price for symbol on date
  const symbolPrice = await getStockHistoricalPricesOnDate(data.symbol, dateFormatDate(data.date));

  // check if symbol exists
  if (!symbolPrice) {
    throw new HttpsError('aborted', SYMBOL_NOT_FOUND_ERROR);
  }

  // check data validity
  executeTransactionOperationDataValidity(userDocData, data, symbolPrice, userTransactions);

  // from previous transaction calculate invested and units - currently if I own that symbol
  const symbolHolding = getCurrentInvestedFromTransactions(data.symbol, userTransactions);
  const symbolHoldingBreakEvenPrice = roundNDigits(symbolHolding.invested / symbolHolding.units, 2);

  // create transaction
  const transaction = createTransaction(userDocData, data, symbolPrice, symbolHoldingBreakEvenPrice);

  // save transaction into user document
  userDocTransactionsRef.update({ transactions: [...userTransactions, transaction] });

  // return data
  return transaction;
};

const createTransaction = (
  userDocData: UserData,
  input: PortfolioTransactionCreate,
  historicalPrice: HistoricalPrice,
  breakEvenPrice: number,
): PortfolioTransaction => {
  const isTransactionFeesActive = userDocData.features.allowPortfolioCashAccount;

  // if custom total value is provided calculate unit price, else use API price
  const unitPrice = input.customTotalValue ? roundNDigits(input.customTotalValue / input.units) : historicalPrice.close;

  const isSell = input.transactionType === 'SELL';
  const returnValue = isSell ? roundNDigits((unitPrice - breakEvenPrice) * input.units) : 0;
  const returnChange = isSell ? roundNDigits((unitPrice - breakEvenPrice) / breakEvenPrice) : 0;

  // transaction fees are 0.01% of the transaction value
  const transactionFeesCalc = isTransactionFeesActive ? ((input.units * unitPrice) / 100) * TRANSACTION_FEE_PRCT : 0;
  const transactionFees = roundNDigits(transactionFeesCalc, 2);

  const result: PortfolioTransaction = {
    transactionId: uuidv4(),
    date: input.date,
    symbol: input.symbol,
    units: input.units,
    transactionType: input.transactionType,
    userId: userDocData.id,
    symbolType: input.symbolType,
    unitPrice,
    transactionFees,
    returnChange,
    returnValue,
  };

  return result;
};

/**
 * prevents selecting weekend for date
 * @param date
 * @returns
 */
const formatWeekendDate = (date: string): string => {
  // check if date is weekend, if so use previous Friday
  let dateObj = isWeekend(new Date(date)) ? subDays(new Date(date), 1) : new Date(date);
  dateObj = isWeekend(dateObj) ? subDays(dateObj, 1) : dateObj;
  const usedData = format(dateObj, 'yyyy-MM-dd');
  return usedData;
};

const getCurrentInvestedFromTransactions = (
  symbol: string,
  userTransactions: PortfolioTransaction[],
): { units: number; invested: number } => {
  return userTransactions
    .filter((d) => d.symbol === symbol)
    .reduce(
      (acc, curr) => ({
        ...acc,
        invested:
          acc.invested + (curr.transactionType === 'BUY' ? curr.unitPrice * curr.units : -curr.unitPrice * curr.units),
        units: acc.units + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
      }),
      { invested: 0, units: 0 } as { units: number; invested: number },
    );
};

/**
 *
 * check to make:
 * - user exists
 * - user has enough cash on hand if BUY and cashAccountActive
 * - user has enough units on hand if SELL
 * - units: positive,
 * - date: valid, not weekend, not future, not too old
 * - symbol: exists
 *
 * @param input
 * @param historicalPrice
 * @param portfolioTransaction
 */
const executeTransactionOperationDataValidity = (
  userData: UserData,
  input: PortfolioTransactionCreate,
  historicalPrice: HistoricalPrice,
  portfolioTransaction: PortfolioTransaction[],
): void => {
  // negative units
  if (input.units <= 0) {
    throw new HttpsError('aborted', TRANSACTION_INPUT_UNITS_POSITIVE);
  }

  // check if units is integer
  if (input.symbolType !== 'CRYPTO' && !Number.isInteger(input.units)) {
    throw new HttpsError('aborted', TRANSACTION_INPUT_UNITS_INTEGER);
  }

  // check if date is valid
  if (!isValid(new Date(input.date))) {
    throw new HttpsError('aborted', DATE_INVALID_DATE);
  }

  // prevent adding future holdings
  if (isBefore(new Date(), new Date(input.date))) {
    throw new HttpsError('aborted', DATE_FUTURE);
  }

  // do not allow selecting weekend for date
  if (isWeekend(new Date(input.date))) {
    throw new HttpsError('aborted', DATE_WEEKEND);
  }

  // get year data form input and today
  const { year: inputYear } = dateGetDetailsInformationFromDate(input.date);
  const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

  // prevent loading more than N year of asset data - just in case
  if (todayYear - inputYear > HISTORICAL_PRICE_RESTRICTION_YEARS) {
    throw new HttpsError('aborted', DATE_TOO_OLD);
  }

  // calculate total value
  const totalValue = roundNDigits(input.units * historicalPrice.close, 2);

  // check if user has enough cash on hand if BUY and cashAccountActive
  if (input.transactionType === 'BUY' && userData.features.allowPortfolioCashAccount) {
    // calculate cash on hand from deposits
    const cashOnHandStarting = userData.portfolioState.startingCash;
    // calculate cash on hand from transactions
    const cashOnHandTransactions = portfolioTransaction.reduce(
      (acc, curr) =>
        curr.transactionType === 'BUY' ? acc - curr.unitPrice * curr.units : acc + curr.unitPrice * curr.units,
      0,
    );

    if (cashOnHandStarting + cashOnHandTransactions < totalValue) {
      throw new HttpsError('aborted', USER_NOT_ENOUGH_CASH_ERROR);
    }
  }

  // check if user has enough units on hand if SELL
  if (input.transactionType === 'SELL') {
    // check if user has any holdings of that symbol
    const symbolTransactions = portfolioTransaction.filter((d) => d.symbol === input.symbol);

    // calculate holding units
    const holdingUnits = symbolTransactions.reduce(
      (acc, curr) => acc + (curr.transactionType === 'BUY' ? curr.units : -curr.units),
      0,
    );
    if (holdingUnits < input.units) {
      throw new HttpsError('aborted', USER_NOT_UNITS_ON_HAND_ERROR);
    }
  }
};
