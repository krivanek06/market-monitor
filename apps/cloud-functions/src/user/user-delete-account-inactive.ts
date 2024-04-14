import {
  USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DELETE,
  USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_FOR_DEMO_DELETE,
} from '@mm/api-types';
import { format, subDays } from 'date-fns';
import { userCollectionDemoAccountRef, userCollectionNormalAccountRef } from '../models';
import { userDeleteAccountById } from './user-delete-account';

/**
 * function to complexly delete inactive accounts
 */
export const userDeleteAccountInactive = async () => {
  await deleteDemoAccounts();
  await deleteNormalAccounts();
};

const deleteDemoAccounts = async () => {
  // query demo accounts which are to be deleted
  const demoAccountDeadline = format(
    subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_FOR_DEMO_DELETE),
    'yyyy-MM-dd',
  );
  const userDemoAccountsToDelete = await userCollectionDemoAccountRef()
    .where('accountCreatedDate', '<=', demoAccountDeadline)
    .get();

  // delete demo accounts
  for (const doc of userDemoAccountsToDelete.docs) {
    await userDeleteAccountById(doc.id);
  }
};

const deleteNormalAccounts = async () => {
  // query normal accounts to be deleted
  const normalAccountDeadline = format(subDays(new Date(), USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DELETE), 'yyyy-MM-dd');
  const userNormalAccountsToDelete = await userCollectionNormalAccountRef()
    .where('lastLoginDate', '<=', normalAccountDeadline)
    .get();

  // delete normal accounts
  for (const doc of userNormalAccountsToDelete.docs) {
    await userDeleteAccountById(doc.id);
  }
};
