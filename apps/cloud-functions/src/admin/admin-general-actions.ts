import {
  AdminGeneralActions,
  AdminGeneralActionsType,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import { createEmptyPortfolioState } from '@mm/shared/general-util';
import { firestore } from 'firebase-admin';
import { userDocumentPortfolioGrowthRef, userDocumentRef, userDocumentTransactionHistoryRef } from '../database';
import { groupGeneralActions } from '../group';

export const adminGeneralActions = async (userAuthId: string | undefined, data: AdminGeneralActions) => {
  if (!userAuthId) {
    return;
  }

  // user who is performing the action
  const authUser = (await userDocumentRef(userAuthId).get()).data();

  // check if user is admin
  if (!authUser?.isAdmin) {
    console.error(`User: ${userAuthId} is not an admin`);
    return;
  }

  if (data.type === 'adminResetUserTransactions') {
    return adminResetUserTransactions(authUser, data);
  }

  if (data.type === 'adminDeleteGroup') {
    return groupGeneralActions(authUser.id, {
      type: 'deleteGroup',
      groupId: data.groupId,
    });
  }
};

const adminResetUserTransactions = async (
  authUser: UserData,
  data: AdminGeneralActionsType<'adminResetUserTransactions'>,
) => {
  // get firestore instance
  const db = firestore();

  return db.runTransaction(async (firebaseTransaction) => {
    // load user data
    const user = (await firebaseTransaction.get(userDocumentRef(data.userId))).data();

    if (!user) {
      console.error(`User: ${data.userId} not found`);
      return;
    }

    const startingCash = user.userAccountType === UserAccountEnum.DEMO_TRADING ? USER_DEFAULT_STARTING_CASH : 0;

    // reset user portfolio
    firebaseTransaction.update(userDocumentRef(data.userId), {
      portfolioState: {
        ...createEmptyPortfolioState(startingCash),
      },
      holdingSnapshot: {
        data: [],
        lastModifiedDate: '',
      },
    } satisfies Partial<UserData>);

    // reset transactions
    firebaseTransaction.set(userDocumentTransactionHistoryRef(data.userId), {
      transactions: [],
    });

    // reset portfolio growth
    firebaseTransaction.set(userDocumentPortfolioGrowthRef(data.userId), {
      data: [],
      lastModifiedDate: '',
    });
  });
};
