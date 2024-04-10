import { waitSeconds } from '@mm/shared/general-util';
import { usersCollectionRef } from '../models';
import { updateUserPortfolioState } from '../portfolio';

/**
 * for each user who is active
 * calculate portfolio state at the end of the day.
 *
 * functions runs multiple time to make sure all users are processed.
 * Select only N users at a time to prevent timeout.
 *
 * At every 5th minute past every hour from 1 through 2am
 */
export const userPortfolioUpdate = async (): Promise<number> => {
  // load users to calculate balance
  const userToUpdate = usersCollectionRef()
    .where('isAccountActive', '==', true)
    .orderBy('portfolioState.date', 'desc')
    .limit(100);

  const users = await userToUpdate.get();

  console.log('Loaded: ', users.docs.length);

  // loop though users, load transactions and calculate balance
  for await (const userDoc of users.docs) {
    // wait N ms prevent too many requests
    await waitSeconds(0.15);

    const user = userDoc.data();

    // update portfolio
    try {
      await updateUserPortfolioState(user);
    } catch (error) {
      console.error('Error updating user portfolio', user.id, error);
    }
  }

  return users.docs.length;
};
