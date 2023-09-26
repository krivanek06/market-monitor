import { PortfolioTransaction } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './utils';

export const transactionsCollectionRef = () =>
  firestore().collection('transactions').withConverter(assignTypes<PortfolioTransaction>());

export const transactionDocumentRef = (transactionId: string) =>
  transactionsCollectionRef().doc(transactionId).withConverter(assignTypes<PortfolioTransaction>());
