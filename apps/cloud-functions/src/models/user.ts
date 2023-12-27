import { PortfolioState, UserData, UserPortfolioTransaction, UserWatchlist } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/features/general-util';
import { firestore } from 'firebase-admin';
import { assignTypes, assignTypesOptional } from './assign-type';

export const usersCollectionRef = () => firestore().collection('users').withConverter(assignTypes<UserData>());

export const userDocumentRef = (userId: string) =>
  usersCollectionRef().doc(userId).withConverter(assignTypesOptional<UserData>());

export const userCollectionMoreInformationRef = (userId: string) =>
  userDocumentRef(userId).collection('more_information');

export const userDocumentTransactionHistoryRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('transactions').withConverter(assignTypes<UserPortfolioTransaction>());

export const userDocumentWatchListRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('watchlist').withConverter(assignTypes<UserWatchlist>());

export const userDefaultStartingCash = 25_000;
export const createUserPortfolioStateEmpty = (startingCash = userDefaultStartingCash): PortfolioState => ({
  cashOnHand: 0,
  startingCash: startingCash,
  holdingsBalance: 0,
  invested: 0,
  numberOfExecutedBuyTransactions: 0,
  numberOfExecutedSellTransactions: 0,
  transactionFees: 0,
  totalGainsPercentage: 0,
  totalGainsValue: 0,
  balance: 0,
  firstTransactionDate: null,
  lastTransactionDate: null,
  date: getCurrentDateDefaultFormat(),
});
