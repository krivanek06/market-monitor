import { getSymbolQuotesCF } from '@mm/api-external';
import {
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
  UserBase,
  UserData,
} from '@mm/api-types';
import {
  calculateGrowth,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  roundNDigits,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { userDocumentRef, userDocumentTransactionHistoryRef } from '../database';
import { userPortfolioRisk } from './portfolio-risk-evaluation';

export const onTransactionUpdateForUserId = async (userId: string): Promise<void> => {
  // load user
  const userRef = userDocumentRef(userId);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  // calculate portfolio state
  const data = await calculateUserPortfolioStateByTransactions(user);

  if (!data) {
    console.error(`Error calculating user portfolio state: ${userId}`);
    return;
  }

  const { portfolioState, portfolioRisk, holdingsBase } = data;

  // update user
  userDocumentRef(user.id).update({
    portfolioState: portfolioState,
    holdingSnapshot: {
      data: holdingsBase,
      lastModifiedDate: getCurrentDateDefaultFormat(),
    },
  } satisfies Partial<UserData>);

  // update portfolio risk
  userDocumentRef(user.id).update({
    portfolioRisk: portfolioRisk,
  } satisfies Partial<UserData>);
};

/**
 * loads transactions for the provided user and calculates portfolio state (balance, cash on hand, invested, risk, etc.)
 *
 * @param userData - user whom to update portfolio state
 */
export const calculateUserPortfolioStateByTransactions = async (userData: UserBase) => {
  // load user data
  const transactionData = (await userDocumentTransactionHistoryRef(userData.id).get()).data()?.transactions ?? [];

  try {
    // get partial holdings calculations
    const holdingsBase = getPortfolioStateHoldingBaseUtil(transactionData);

    // get symbol summaries from API
    const partialHoldingSymbols = holdingsBase.map((d) => d.symbol);
    const symbolQuotes = partialHoldingSymbols.length > 0 ? await getSymbolQuotesCF(partialHoldingSymbols) : [];

    // get portfolio state
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(
      transactionData,
      holdingsBase,
      symbolQuotes,
      userData.portfolioState.startingCash,
    );

    // remove holdings
    const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings);

    // calculation risk of investment
    const portfolioRisk = await userPortfolioRisk(portfolioStateHoldings);

    // log
    console.log(
      `Updated user: ${userData.personal.displayName}, ${userData.id}, holdings: ${portfolioStateHoldings.holdings.length}`,
    );

    // return some data to use it later if needed
    return {
      portfolioState,
      portfolioRisk,
      symbolQuotes,
      holdingsBase,
    };
  } catch (e) {
    console.warn(`Error for user: ${userData.personal.displayName}, ${userData.id}: ${e}`);
  }
};

/**
 * calculates user's portfolio based on provided data. Used in Cloud Functions and on FE
 *
 * @param accountType - user's account type
 * @param transactions - user's transactions
 * @param partialHoldings - user's data for current holdings
 * @param symbolSummaries - loaded summaries for user's holdings
 * @returns
 */
const getPortfolioStateHoldingsUtil = (
  transactions: PortfolioTransaction[],
  partialHoldings: PortfolioStateHoldingBase[],
  symbolQuotes: SymbolQuote[],
  startingCash = 0,
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  // value that user invested in all assets
  const investedTotal = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  // user's holdings with summary data
  const portfolioStateHolding = symbolQuotes
    .map((quote) => {
      const holding = partialHoldings.find((d) => d.symbol === quote.symbol);
      if (!holding) {
        console.log(`Holding not found for symbol ${quote.symbol}`);
        return null;
      }
      return {
        ...holding,
        invested: roundNDigits(holding.invested),
        breakEvenPrice: roundNDigits(holding.invested / holding.units),
        weight: roundNDigits(holding.invested / investedTotal, 6),
        symbolQuote: quote,
      } satisfies PortfolioStateHolding;
    })
    .filter((d) => !!d) as PortfolioStateHolding[];

  // sort holdings by balance
  const portfolioStateHoldingSortedByBalance = [...portfolioStateHolding].sort(
    (a, b) => b.symbolQuote.price * b.units - a.symbolQuote.price * a.units,
  );

  // value of all assets
  const holdingsBalance = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.price * curr.units, 0);

  // calculate profit/loss from created transactions
  const transactionProfitLoss = transactions.reduce((acc, curr) => acc + (curr?.returnValue ?? 0), 0);

  // current cash on hand
  const cashOnHandTransactions =
    (startingCash !== 0 ? startingCash - investedTotal - transactionFees : 0) + transactionProfitLoss;

  const balance = holdingsBalance + cashOnHandTransactions;
  const totalGainsValue = startingCash !== 0 ? balance - startingCash : holdingsBalance - investedTotal;
  const totalGainsPercentage =
    startingCash !== 0 ? calculateGrowth(balance, startingCash) : calculateGrowth(balance, investedTotal);
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  // calculate daily portfolio change
  const balanceChange = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.change * curr.units, 0);
  const balanceChangePrct = holdingsBalance === 0 ? 0 : calculateGrowth(balance, balance - balanceChange);

  const result: PortfolioStateHoldings = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees),
    cashOnHand: roundNDigits(cashOnHandTransactions),
    balance: roundNDigits(balance),
    invested: roundNDigits(investedTotal),
    holdingsBalance: roundNDigits(holdingsBalance),
    totalGainsValue: roundNDigits(totalGainsValue),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 4),
    startingCash: roundNDigits(startingCash),
    firstTransactionDate,
    lastTransactionDate,
    date: getCurrentDateDetailsFormat(),
    // calculate data for previous portfolio
    previousBalanceChange: balanceChange,
    previousBalanceChangePercentage: balanceChangePrct,
    holdings: portfolioStateHoldingSortedByBalance,
  };

  return result;
};

/**
 * get partial data for user's current holdings from all previous transactions, where units are more than 0
 *
 * @param transactions - user's transactions
 * @returns
 */
const getPortfolioStateHoldingBaseUtil = (transactions: PortfolioTransaction[]): PortfolioStateHoldingBase[] => {
  return transactions
    .reduce((acc, curr) => {
      const existingHolding = acc.find((d) => d.symbol === curr.symbol);
      const isSell = curr.transactionType === 'SELL';
      // update existing holding
      if (existingHolding) {
        const newUnits = existingHolding.units + (isSell ? -curr.units : curr.units);
        existingHolding.units = curr.sector === 'CRYPTO' ? roundNDigits(newUnits, 4) : roundNDigits(newUnits);
        existingHolding.invested += roundNDigits(
          isSell ? -(existingHolding.breakEvenPrice * curr.units) : curr.unitPrice * curr.units,
        );
        existingHolding.breakEvenPrice = roundNDigits(existingHolding.invested / existingHolding.units);
        return acc;
      }

      // first value can not be sell
      if (isSell) {
        console.error('First transaction can not be sell');
      }

      // add new holding
      return [
        ...acc,
        {
          symbolType: curr.symbolType,
          symbol: curr.symbol,
          sector: curr.sector,
          units: curr.units,
          invested: roundNDigits(curr.unitPrice * curr.units),
          breakEvenPrice: curr.unitPrice,
        } satisfies PortfolioStateHoldingBase,
      ];
    }, [] as PortfolioStateHoldingBase[])
    .filter((d) => d.units > 0);
};
