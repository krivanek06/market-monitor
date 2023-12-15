import { PortfolioTransaction } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes, assignTypesOptional } from './assign-type';

export const transactionsCollectionRef = () =>
  firestore().collection('transactions').withConverter(assignTypes<PortfolioTransaction>());

export const transactionDocumentRef = (transactionId: string) =>
  transactionsCollectionRef().doc(transactionId).withConverter(assignTypesOptional<PortfolioTransaction>());
