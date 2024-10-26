import { OutstandingOrder } from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const outstandingOrderCollectionRef = () =>
  firestore().collection('outstanding_orders').withConverter(assignTypes<OutstandingOrder>());

export const outstandingOrderDocRef = (orderId: string) => outstandingOrderCollectionRef().doc(orderId);
