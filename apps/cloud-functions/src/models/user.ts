import { UserData, UserPortfolioTransaction } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes, assignTypesOptional } from './assign-type';

export const usersCollectionRef = () => firestore().collection('users').withConverter(assignTypes<UserData>());

export const userDocumentRef = (userId: string) =>
  usersCollectionRef().doc(userId).withConverter(assignTypesOptional<UserData>());

export const userCollectionMoreInformationRef = (userId: string) =>
  userDocumentRef(userId).collection('more_information');

export const userDocumentTransactionHistoryRef = (userId: string) =>
  userCollectionMoreInformationRef(userId).doc('transactions').withConverter(assignTypes<UserPortfolioTransaction>());
