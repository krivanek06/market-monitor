import { PortfolioTransaction } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypesServer } from './assign-type';

export const transactionsCollectionRef = () =>
  firestore().collection('transactions').withConverter(assignTypesServer<PortfolioTransaction>());

export const transactionDocumentRef = (transactionId: string) =>
  transactionsCollectionRef().doc(transactionId).withConverter(assignTypesServer<PortfolioTransaction>());
