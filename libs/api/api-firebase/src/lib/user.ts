import { User } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './utils';

export const usersCollectionRef = firestore().collection('users');
export const userDocumentRef = (userId: string) => usersCollectionRef.doc(userId).withConverter(assignTypes<User>());
