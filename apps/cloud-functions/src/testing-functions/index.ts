import { getSymbolSummaries } from '@mm/api-external';
import { SymbolSummary, UserPortfolioTransaction, UserWatchList } from '@mm/api-types';
import { waitSeconds } from '@mm/shared/general-util';
import { onRequest } from 'firebase-functions/v2/https';
import { groupHallOfFame, groupPortfolioRank, groupUpdateData } from '../group';
import { userDocumentTransactionHistoryRef, userDocumentWatchListRef, usersCollectionRef } from '../models';
import {
  userDeactivateInactiveAccounts,
  userDeleteDemoAccounts,
  userDeleteNormalAccounts,
  userHallOfFame,
  userPortfolioRank,
} from '../user';
import { runFunctionInEmulator } from './../utils';
import { reloadDatabase } from './reload-database';

// DEVELOPMENT ----------------------------
export const test_reload_database = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    // delete and reload data for users and groups
    await reloadDatabase();

    console.log('[Groups]: update portfolio');
    await groupUpdateData();

    console.log('[Users]: update rank');
    await userPortfolioRank();

    console.log('[Groups]: update rank');
    await groupPortfolioRank();

    console.log('[Users]: update hall of fame');
    await userHallOfFame();

    console.log('[Groups]: update hall of fame');
    await groupHallOfFame();

    res.send('ok');
  });
});

export const test_function = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    console.log('process.env.FUNCTIONS_EMULATOR ', process.env.FUNCTIONS_EMULATOR);
    console.log('process.env.FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);

    console.log('[Users]: update portfolio');

    res.send('ok');
  });
});

export const test_delete_user_accounts = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  await runFunctionInEmulator(async () => {
    console.log('[Users]: deactivate necessary accounts');
    await userDeactivateInactiveAccounts();

    console.log('[Users]: delete demo or inactive accounts');
    await userDeleteDemoAccounts();

    console.log('[Users]: delete old inactive accounts');
    await userDeleteNormalAccounts();

    res.send('ok');
  });
});

/**
 * for each user into each transaction, update the sector
 */
export const test_update_user_transactions_data = onRequest({ timeoutSeconds: 1200 }, async (req, res) => {
  const allUsers = (await usersCollectionRef().get()).docs.map((d) => d.data());
  const loadedSummariesMap = new Map<string, SymbolSummary>();

  // update transactions & watchlists
  for (const user of allUsers) {
    const userTransactions = (await userDocumentTransactionHistoryRef(user.id).get()).data()?.transactions ?? [];
    const userWatchList = (await userDocumentWatchListRef(user.id).get()).data()?.data ?? [];

    const transactionSymbols = userTransactions.map((d) => d.symbol);
    const watchListSymbols = userWatchList.map((d) => d.symbol);

    const distinctSymbols = [...new Set([...transactionSymbols, ...watchListSymbols])];
    const unloadedSummaries = distinctSymbols.filter((d) => !loadedSummariesMap.has(d));

    console.log('Loading Summaries for:', distinctSymbols.length, distinctSymbols);

    // load summaries
    const loadedSummaries = await getSymbolSummaries(unloadedSummaries);

    // update map
    loadedSummaries.forEach((d) => loadedSummariesMap.set(d.id, d));

    // modify transactions
    const updatedUserTransactions = userTransactions.map((transaction) => ({
      ...transaction,
      sector: loadedSummariesMap.get(transaction.symbol)?.profile?.sector ?? 'Unknown',
    }));

    // modify watchlist
    const updatedUserWatchlist = userWatchList.map((watchlist) => ({
      ...watchlist,
      sector: loadedSummariesMap.get(watchlist.symbol)?.profile?.sector ?? 'Unknown',
    }));

    // update data
    await userDocumentTransactionHistoryRef(user.id).update({
      transactions: updatedUserTransactions,
    } satisfies Partial<UserPortfolioTransaction>);

    await userDocumentWatchListRef(user.id).update({
      data: updatedUserWatchlist,
    } satisfies Partial<UserWatchList>);

    await waitSeconds(0.5);

    console.log(`Updated user: ${user.personal.displayName}, transactions: ${userTransactions.length}, [${user.id}]`);
  }
});
