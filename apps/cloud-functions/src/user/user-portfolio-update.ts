import { PortfolioGrowth, UserData } from '@mm/api-types';
import { getCurrentDateDefaultFormat, waitSeconds } from '@mm/shared/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import { userCollectionActiveAccountRef, userDocumentPortfolioGrowthRef, userDocumentRef } from '../database';
import { calculateUserPortfolioStateByTransactions } from '../portfolio';

/**
 * for each user who is active
 * calculate portfolio state at the end of the day.
 */
export const userPortfolioUpdate = async (): Promise<number> => {
  // create threshold of today
  const today = getCurrentDateDefaultFormat();

  // load users to calculate balance if it was not calculated today
  const userToUpdate = userCollectionActiveAccountRef().where('dates.portfolioGrowthDate', '!=', today).limit(100);

  const users = await userToUpdate.get();

  console.log('Loaded: ', users.docs.length);

  // loop though users, load transactions and calculate balance
  for await (const userDoc of users.docs) {
    // wait N ms prevent too many requests
    await waitSeconds(0.15);

    const user = userDoc.data();

    try {
      // calculate portfolio state
      const data = await calculateUserPortfolioStateByTransactions(user);

      if (!data) {
        console.error(`Error calculating user portfolio state: ${user.id}`);
        continue;
      }

      const { portfolioState, portfolioRisk, holdingsBase } = data;

      // update user
      userDocumentRef(user.id).update({
        portfolioState: portfolioState,
        holdingSnapshot: {
          data: holdingsBase,
          lastModifiedDate: getCurrentDateDefaultFormat(),
        },
        dates: {
          ...user.dates,
          portfolioGrowthDate: today,
        },
      } satisfies Partial<UserData>);

      // update portfolio risk
      userDocumentRef(user.id).update({
        portfolioRisk: portfolioRisk,
      } satisfies Partial<UserData>);

      // update portfolio growth
      userDocumentPortfolioGrowthRef(user.id).update({
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: FieldValue.arrayUnion({
          date: getCurrentDateDefaultFormat(),
          balanceTotal: portfolioState.balance,
          investedTotal: portfolioState.invested,
          marketTotal: portfolioState.holdingsBalance,
        } satisfies PortfolioGrowth),
      });
    } catch (error) {
      console.error('Error updating user portfolio', user.id, error);
    }
  }

  return users.docs.length;
};
