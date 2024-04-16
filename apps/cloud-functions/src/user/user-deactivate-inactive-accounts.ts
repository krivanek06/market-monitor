import { USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT, UserData } from '@mm/api-types';
import { format, subDays } from 'date-fns';
import { userCollectionActiveAccountRef } from '../models';

/**
 * accounts where user did not log in more than USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT days will be inactive
 */
export const userDeactivateInactiveAccounts = async () => {
  const loginDeadline = format(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT), 'yyyy-MM-dd');
  const userAccountsToInactivate = await userCollectionActiveAccountRef()
    .where('lastLoginDate', '<=', loginDeadline)
    .get();

  console.log('User accounts to inactivate: ', userAccountsToInactivate.docs.length);

  // deactivate accounts
  for (const doc of userAccountsToInactivate.docs) {
    await doc.ref.update({
      isAccountActive: false,
    } satisfies Partial<UserData>);
  }
};
