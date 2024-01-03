import { HallOfFameUsers } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypesOptional } from './assign-type';

export const aggregationCollectionRef = () => firestore().collection('aggregations');
export const aggregationHallOfFameUsersRef = () =>
  aggregationCollectionRef().doc('hall_of_fame_users').withConverter(assignTypesOptional<HallOfFameUsers>());
