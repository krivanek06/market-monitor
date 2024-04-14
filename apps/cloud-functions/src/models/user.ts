import { UserAccountEnum, UserData, UserPortfolioTransaction, UserWatchList } from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const usersCollectionRef = () => firestore().collection('users').withConverter(assignTypes<UserData>());

export const userCollectionDemoAccountRef = () => usersCollectionRef().where('isDemo', '==', true);
export const userCollectionActiveAccountRef = () => usersCollectionRef().where('isAccountActive', '==', true);

export const usersCollectionDemoTradingRef = () =>
  userCollectionActiveAccountRef()
    .where('userAccountType', '==', UserAccountEnum.DEMO_TRADING)
    .withConverter(assignTypes<UserData>());

export const userDocumentRef = (userId: string) => usersCollectionRef().doc(userId);

export const userCollectionMoreInformationRef = (userId: string) =>
  userDocumentRef(userId).collection('more_information');

export const userDocumentTransactionHistoryRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('transactions').withConverter(assignTypes<UserPortfolioTransaction>());

export const userDocumentWatchListRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('watchlist').withConverter(assignTypes<UserWatchList>());
