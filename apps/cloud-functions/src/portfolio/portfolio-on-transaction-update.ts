import { getSymbolQuotesCF } from '@mm/api-external';
import { UserBase, UserData } from '@mm/api-types';
import {
  getCurrentDateDefaultFormat,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  getPortfolioStateHoldingsUtil,
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
      symbols: holdingsBase.map((h) => h.symbol),
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
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(transactionData, symbolQuotes, openOrders);

    // remove holdings
    const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings);

    // calculation risk of investment
    const portfolioRisk = await userPortfolioRisk(portfolioStateHoldings.holdings);

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
