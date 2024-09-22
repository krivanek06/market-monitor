import { getSymbolQuotes } from '@mm/api-external';
import { UserBase, UserData } from '@mm/api-types';
import {
  getCurrentDateDefaultFormat,
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { userDocumentRef, userDocumentTransactionHistoryRef } from '../models';
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
    const symbolQuotes = partialHoldingSymbols.length > 0 ? await getSymbolQuotes(partialHoldingSymbols) : [];

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
