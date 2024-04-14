import { USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT } from '@mm/api-types';
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

  // deactivate accounts
  for (const doc of userAccountsToInactivate.docs) {
    await doc.ref.update({
      isActive: false,
    });
  }
};
