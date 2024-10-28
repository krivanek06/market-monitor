import { OutstandingOrder } from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const outstandingOrderCollectionRef = () =>
  firestore().collection('outstanding_orders').withConverter(assignTypes<OutstandingOrder>());

export const outstandingOrderCollectionStatusOpenRef = () =>
  outstandingOrderCollectionRef().where('status', '==', 'OPEN');

export const outstandingOrderCollectionByUserRef = (userId: string) =>
  outstandingOrderCollectionRef().where('userData.id', '==', userId);

export const outstandingOrderCollectionByUserStatusOpenRef = (userId: string) =>
  outstandingOrderCollectionByUserRef(userId).where('status', '==', 'OPEN');

export const outstandingOrderCollectionByUserStatusClosedRef = (userId: string) =>
  outstandingOrderCollectionByUserRef(userId).where('status', '==', 'CLOSED');

export const outstandingOrderDocRef = (orderId: string) => outstandingOrderCollectionRef().doc(orderId);
