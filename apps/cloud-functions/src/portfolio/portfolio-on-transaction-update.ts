import { getSymbolQuotes } from '@mm/api-external';
import { UserBase, UserData } from '@mm/api-types';
import {
  getCurrentDateDefaultFormat,
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
  transformPortfolioStateHoldingToPortfolioState,
} from '@mm/shared/general-util';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { userDocumentRef, userDocumentTransactionHistoryRef } from '../models';
import { userPortfolioRisk } from './portfolio-risk-evaluation';

export const onTransactionUpdate = onDocumentUpdated('users/{userId}/more_information/transactions', async (event) => {
  const userId = event.params.userId;

  // load user
  const userRef = userDocumentRef(userId);
  const user = (await userRef.get()).data();

  if (!user) {
    console.error(`User not found: ${userId}`);
    return;
  }

  await updateUserPortfolioState(user);
});

/**
 * loads transactions for the provided user and calculates portfolio state (balance, cash on hand, invested, risk, etc.)
 *
 * @param userData - user whom to update portfolio state
 */
export const updateUserPortfolioState = async (userData: UserBase, isAfterHours: boolean = false): Promise<void> => {
  const today = getCurrentDateDefaultFormat();

  // load transaction per user
  const transactionRef = userDocumentTransactionHistoryRef(userData.id);
  const transactionData = (await transactionRef.get()).data()?.transactions ?? [];

  try {
    // get partial holdings calculations
    const holdingsBase = getPortfolioStateHoldingBaseUtil(transactionData);

    // get symbol summaries from API
    const partialHoldingSymbols = holdingsBase.map((d) => d.symbol);
    const symbolQuotes =
      partialHoldingSymbols.length > 0 ? await getSymbolQuotes(partialHoldingSymbols, isAfterHours) : [];

    // get portfolio state
    const portfolioStateHoldings = getPortfolioStateHoldingsUtil(
      transactionData,
      holdingsBase,
      symbolQuotes,
      userData.portfolioState.startingCash,
    );

    // remove holdings
    const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings);

    // update user
    userDocumentRef(userData.id).update({
      portfolioState: portfolioState,
      holdingSnapshot: {
        data: holdingsBase,
        lastModifiedDate: today,
      },
    } satisfies Partial<UserData>);

    // calculation risk of investment
    const portfolioRisk = await userPortfolioRisk(portfolioStateHoldings);

    // update user
    userDocumentRef(userData.id).update({
      portfolioRisk: portfolioRisk,
    } satisfies Partial<UserData>);

    // log
    console.log(
      `Updated user: ${userData.personal.displayName}, ${userData.id}, holdings: ${portfolioStateHoldings.holdings.length}`,
    );
  } catch (e) {
    console.warn(`Error for user: ${userData.personal.displayName}, ${userData.id}: ${e}`);
  }
};
