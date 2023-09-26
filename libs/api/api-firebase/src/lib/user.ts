import { User, UserPortfolioTransaction } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './utils';

export const usersCollectionRef = () => firestore().collection('users').withConverter(assignTypes<User>());

export const userDocumentRef = (userId: string) => usersCollectionRef().doc(userId).withConverter(assignTypes<User>());

export const userCollectionMoreInformationRef = (userId: string) =>
  userDocumentRef(userId).collection('more_information');

export const userDocumentTransactionHistoryRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('transactions').withConverter(assignTypes<UserPortfolioTransaction>());
