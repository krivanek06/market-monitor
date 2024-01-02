import { getSymbolSummaries } from '@market-monitor/api-external';
import {
  getCurrentDateDefaultFormat,
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
} from '@market-monitor/shared/features/general-util';
import { format, subDays } from 'date-fns';
import { userDocumentTransactionHistoryRef, usersCollectionRef } from '../models';
import { transformPortfolioStateHoldingToPortfolioState } from '../utils';

/**
 * for each user who is active
 * calculate portfolio state at the end of the day.
 *
 * functions runs multiple time to make sure all users are processed.
 * Select only N users at a time to prevent timeout.
 *
 * At every 5th minute past every hour from 1 through 2am
 */
export const userUpdatePortfolioScheduler = async (): Promise<void> => {
  const today = getCurrentDateDefaultFormat();
  const twoWeeksBefore = format(subDays(new Date(), 14), 'yyyy-MM-dd');
  console.log('today', today);
  // load users to calculate balance
  const userToUpdate = usersCollectionRef()
    // .where('lastLoginDate', '>=', twoWeeksBefore) // not able to use this filter
    .where('portfolioState.date', '!=', today)
    .orderBy('portfolioState.date', 'desc')
    .orderBy('lastLoginDate', 'desc')
    .limit(200);

  const users = await userToUpdate.get();

  console.log('Loaded: ', users.docs.length);

  // loop though users, load transactions and calculate balance
  for await (const userDoc of users.docs) {
    // load transaction per user
    const transactionRef = userDocumentTransactionHistoryRef(userDoc.id);
    const transactions = (await transactionRef.get()).data();
    const user = userDoc.data();

    // skip if no transactions
    if (!transactions) {
      console.log(`No transactions for user: ${user.personal.displayName}, ${userDoc.id}`);
      continue;
    }

    try {
      // get partial holdings calculations
      const holdingsBase = getPortfolioStateHoldingBaseUtil(transactions.transactions);

      // get symbol summaries from API
      const partialHoldingSymbols = holdingsBase.map((d) => d.symbol);
      const summaries = partialHoldingSymbols.length > 0 ? await getSymbolSummaries(partialHoldingSymbols) : [];

      // get portfolio state
      const portfolioStateHoldings = getPortfolioStateHoldingsUtil(
        user.portfolioState,
        transactions.transactions,
        holdingsBase,
        summaries,
      );

      // remove holdings
      const portfolioState = transformPortfolioStateHoldingToPortfolioState(portfolioStateHoldings);

      // update user
      userDoc.ref.update({
        portfolioState: portfolioState,
        holdingSnapshot: {
          data: holdingsBase,
          lastModifiedDate: today,
        },
      });

      // log
      console.log(`Updated user: ${user.personal.displayName}, ${userDoc.id}`);
    } catch (e) {
      console.warn(`Error for user: ${user.personal.displayName}, ${userDoc.id}: ${e}`);
    }

    console.log('Finished');
  }
};
