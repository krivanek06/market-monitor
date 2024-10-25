import { OutstandingOrder } from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const outstandingORderCollectionRef = () =>
  firestore().collection('outstanding_orders').withConverter(assignTypes<OutstandingOrder>());
