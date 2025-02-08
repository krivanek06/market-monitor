import { getHistoricalPricesOnDateRange, getIsMarketOpenCF } from '@mm/api-external';
import {
  AdminGeneralActions,
  AdminGeneralActionsType,
  HistoricalPrice,
  USER_DEFAULT_STARTING_CASH,
  UserAccountEnum,
  UserData,
} from '@mm/api-types';
import {
  createEmptyPortfolioState,
  getCurrentDateDefaultFormat,
  getPortfolioGrowth,
  getPortfolioGrowthAssets,
  getTransactionsStartDate,
  getYesterdaysDate,
} from '@mm/shared/general-util';
import { format } from 'date-fns';
import { firestore } from 'firebase-admin';
import { userDocumentPortfolioGrowthRef, userDocumentRef, userDocumentTransactionHistoryRef } from '../database';
import { groupGeneralActions } from '../group';
import { calculateUserPortfolioStateByTransactions } from '../portfolio';

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

  if (data.type === 'adminRecalculateUserPortfolioGrowth') {
    return adminRecalculateUserPortfolioGrowth(authUser, data);
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
      portfolioRisk: {
        alpha: 0,
        beta: 0,
        sharpe: 0,
        volatility: 0,
        date: '',
      },
      holdingSnapshot: {
        data: [],
        lastModifiedDate: '',
        symbols: [],
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

const adminRecalculateUserPortfolioGrowth = async (
  authUser: UserData,
  data: AdminGeneralActionsType<'adminRecalculateUserPortfolioGrowth'>,
) => {
  // get firestore instance
  const db = firestore();

  return db.runTransaction(async (firebaseTransaction) => {
    // load user data
    const user = (await firebaseTransaction.get(userDocumentRef(data.userId))).data();
    const userTransactions = (await firebaseTransaction.get(userDocumentTransactionHistoryRef(data.userId))).data();

    if (!user || !userTransactions) {
      console.error(`User: ${data.userId} not found`);
      return;
    }

    const portfolioByTransactions = await calculateUserPortfolioStateByTransactions(user);

    if (!portfolioByTransactions) {
      console.error(`Error calculating user portfolio state: ${user.id}, ${user.personal.displayName}`);
      return false;
    }

    // update user
    userDocumentRef(user.id).update({
      portfolioState: portfolioByTransactions.portfolioState,
      holdingSnapshot: {
        data: portfolioByTransactions.holdingsBase,
        lastModifiedDate: getCurrentDateDefaultFormat(),
        symbols: portfolioByTransactions.holdingsBase.map((h) => h.symbol),
      },
    } satisfies Partial<UserData>);

    // update portfolio risk
    userDocumentRef(user.id).update({
      portfolioRisk: portfolioByTransactions.portfolioRisk,
    } satisfies Partial<UserData>);

    // recalculate portfolio growth
    const transactionStart = getTransactionsStartDate(userTransactions.transactions);

    // load historical prices for all holdings
    const yesterDay = getYesterdaysDate();
    const allHolidays = (await getIsMarketOpenCF())?.allHolidays ?? [];
    const historicalPricesPromise = await Promise.all(
      transactionStart.map((transaction) =>
        getHistoricalPricesOnDateRange(transaction.symbol, format(transaction.startDate, 'yyyy-MM-dd'), yesterDay),
      ),
    );
    const historicalPrices = historicalPricesPromise.reduce(
      (acc, curr, index) => ({ ...acc, [transactionStart[index].symbol]: curr }),
      {} as { [key: string]: HistoricalPrice[] },
    );

    const portfolioGrowthAssets = getPortfolioGrowthAssets(userTransactions.transactions, historicalPrices);
    const portfolioGrowth = getPortfolioGrowth(portfolioGrowthAssets, user.portfolioState.startingCash, allHolidays);

    // update portfolio growth
    userDocumentPortfolioGrowthRef(user.id).update({
      lastModifiedDate: getCurrentDateDefaultFormat(),
      data: portfolioGrowth,
    });
  });
};
