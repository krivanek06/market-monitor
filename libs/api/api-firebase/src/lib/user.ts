import { User } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './utils';

export const userCollectionRef = firestore().collection('users');
export const userDocumentRef = (userId: string) => userCollectionRef.doc(userId).withConverter(assignTypes<User>());
