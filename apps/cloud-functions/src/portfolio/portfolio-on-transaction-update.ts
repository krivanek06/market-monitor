import { getSymbolQuotesCF } from '@mm/api-external';
import {
  OutstandingOrder,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
  USER_DEFAULT_STARTING_CASH,
  UserBase,
  UserData,
} from '@mm/api-types';
import {
  calculateGrowth,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  roundNDigits,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import {
  outstandingOrderCollectionByUserStatusOpenRef,
  userDocumentRef,
  userDocumentTransactionHistoryRef,
} from '../database';
import { userPortfolioRisk } from './portfolio-risk-evaluation';

export const recalculateUserPortfolioStateToUser = async (user: UserData): Promise<boolean> => {
  const data = await calculateUserPortfolioStateByTransactions(user);

  if (!data) {
    console.error(`Error calculating user portfolio state: ${user.id}, ${user.personal.displayName}`);
    return false;
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

  return true;
};

/**
 * loads transactions for the provided user and calculates portfolio state (balance, cash on hand, invested, risk, etc.)
 *
 * @param userData - user whom to update portfolio state
 */
export const calculateUserPortfolioStateByTransactions = async (userData: UserBase) => {
  // load user transactions
  const transactionData = (await userDocumentTransactionHistoryRef(userData.id).get()).data()?.transactions ?? [];
  // load user open orders
  const openOrders = (await outstandingOrderCollectionByUserStatusOpenRef(userData.id).get()).docs.map((doc) =>
    doc.data(),
  );

  try {
    // get partial holdings calculations
    const holdingsBase = getPortfolioStateHoldingBaseByTransactionsUtil(transactionData, openOrders);

    // get symbol summaries from API
    const partialHoldingSymbols = holdingsBase.map((d) => d.symbol);
    const symbolQuotes = partialHoldingSymbols.length > 0 ? await getSymbolQuotesCF(partialHoldingSymbols) : [];

    // get portfolio state
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(
      transactionData,
      holdingsBase,
      symbolQuotes,
      openOrders,
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
  openOrders: OutstandingOrder[] = [],
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);
  const startingCash = USER_DEFAULT_STARTING_CASH;

  // value that user invested in all assets
  const investedTotal = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  // user's holdings with summary data
  const portfolioStateHolding = symbolQuotes
    .map((quote) => {
      const holding = partialHoldings.find((d) => d.symbol === quote.symbol);

      // user can have multiple open orders for the same symbol
      const symbolSellOrderUnits = openOrders
        .filter((d) => d.symbol === quote.symbol && d.orderType.type === 'SELL')
        .reduce((acc, curr) => acc + curr.units, 0);

      if (!holding) {
        console.log(`Holding not found for symbol ${quote.symbol}`);
        return null;
      }

      return {
        ...holding,
        units: roundNDigits(holding.units - symbolSellOrderUnits, 4),
        invested: roundNDigits(holding.invested),
        breakEvenPrice: roundNDigits(holding.invested / holding.units, 4),
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
  const transactionProfitLoss = transactions.reduce(
    // prevent NaN, undefined and Infinity
    (acc, curr) => acc + (isFinite(curr.returnValue) ? curr.returnValue : 0),
    0,
  );

  // remove cash spent on open orders
  const spentCashOnOpenOrders = openOrders
    .filter((d) => d.orderType.type === 'BUY')
    .reduce((acc, curr) => acc + curr.potentialTotalPrice, 0);

  // current cash on hand
  const cashOnHandTransactions =
    startingCash - investedTotal + transactionProfitLoss - spentCashOnOpenOrders - transactionFees;

  const balance = holdingsBalance + cashOnHandTransactions + spentCashOnOpenOrders;
  const totalGainsValue = balance - startingCash;
  const totalGainsPercentage = calculateGrowth(balance, startingCash);
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
